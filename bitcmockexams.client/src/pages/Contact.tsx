import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';
import Modal from '@shared/components/ui/Modal';
import SEO from '@shared/components/SEO';
import { getRecaptchaToken } from '@shared/utils/recaptchaV3';
import { useContactApi, CountryCode } from '@shared/api/contact';

const Contact = () => {
    const { submitContactForm, getCountryCodes } = useContactApi();
    const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        countryCode: '+91',
        phone: '',
        email: '',
        howDidYouFindUs: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaError, setCaptchaError] = useState<string | null>(null);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    // Fetch country codes on component mount
    useEffect(() => {
        const fetchCountryCodes = async () => {
            setIsLoadingCountries(true);
            const codes = await getCountryCodes();
            setCountryCodes(codes);
            
            // Set India as default if it exists in the codes
            const india = codes.find(c => c.code === '+91');
            if (india) {
                setFormData(prev => ({
                    ...prev,
                    countryCode: india.code
                }));
            }
            
            setIsLoadingCountries(false);
        };
        fetchCountryCodes();
    }, []);

    // Get the current country's phone pattern
    const getCurrentPhonePattern = (): string | null => {
        const country = countryCodes.find(c => c.code === formData.countryCode);
        return country?.pattern || null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // If country code is changing and there's a phone number, validate it with new pattern
        if (name === 'countryCode' && formData.phone.trim()) {
            const newCountry = countryCodes.find(c => c.code === value);
            if (newCountry?.pattern) {
                const regex = new RegExp(newCountry.pattern);
                if (!regex.test(formData.phone)) {
                    setErrors(prev => ({
                        ...prev,
                        phone: `Invalid phone number format for ${newCountry.name}`
                    }));
                } else {
                    // Clear phone error if now valid
                    setErrors(prev => ({
                        ...prev,
                        phone: ''
                    }));
                }
            }
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing (except for countryCode which we handle above)
        if (errors[name] && name !== 'countryCode') {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newErrors: Record<string, string> = {};

        // Validate the specific field that lost focus
        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Name is required';
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    newErrors.phone = 'Phone number is required';
                } else {
                    const pattern = getCurrentPhonePattern();
                    if (pattern) {
                        const regex = new RegExp(pattern);
                        if (!regex.test(value)) {
                            const country = countryCodes.find(c => c.code === formData.countryCode);
                            newErrors.phone = `Invalid phone number format for ${country?.name || 'selected country'}`;
                        }
                    }
                }
                break;
            case 'email':
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.email = 'Email is invalid';
                }
                break;
            case 'howDidYouFindUs':
                if (!value.trim()) {
                    newErrors.howDidYouFindUs = 'Please select how you found us';
                }
                break;
            case 'message':
                if (!value.trim()) {
                    newErrors.message = 'Message is required';
                }
                break;
        }

        // Update errors for this field
        setErrors(prev => ({
            ...prev,
            ...newErrors
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else {
            const pattern = getCurrentPhonePattern();
            if (pattern) {
                const regex = new RegExp(pattern);
                if (!regex.test(formData.phone)) {
                    const country = countryCodes.find(c => c.code === formData.countryCode);
                    newErrors.phone = `Invalid phone number format for ${country?.name || 'selected country'}`;
                }
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.howDidYouFindUs.trim()) {
            newErrors.howDidYouFindUs = 'Please select how you found us';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        return newErrors;
    };

    const isFormComplete = () => {
        return (
            formData.name.trim() !== '' &&
            formData.countryCode.trim() !== '' &&
            formData.phone.trim() !== '' &&
            formData.email.trim() !== '' &&
            formData.howDidYouFindUs.trim() !== '' &&
            formData.message.trim() !== ''
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Obtain v3 token for this action
        let captchaToken: string | null = null;
        try {
            captchaToken = await getRecaptchaToken('contact_submit');
            setCaptchaError(null);
        } catch (err: any) {
            setCaptchaError(err?.message || 'reCAPTCHA verification failed');
            return;
        }

        setIsSubmitting(true);

        try {
            // Map form data to ContactUsVM format (matching C# model)
            const contactData = {
                Name: formData.name,
                EmailId: formData.email,  // Changed to EmailId to match C# model
                PhoneNumber: `${formData.countryCode} ${formData.phone}`,
                HowDidYouFindUs: formData.howDidYouFindUs,  // Separate field
                Query: formData.message  // Just the message, not combined
            };
            const response = await submitContactForm(contactData, captchaToken || undefined);
            if (response.message !== 'Something went wrong with the verification. Please retry.') {
                setModalState({
                    isOpen: true,
                    type: 'success',
                    title: 'Success!',
                    message: response.message || 'Thank you for your message! We will get back to you soon.'
                });
                setFormData({ name: '', countryCode: '+91', phone: '', email: '', howDidYouFindUs: '', message: '' });
                setErrors({});
            } else {
                setModalState({
                    isOpen: true,
                    type: 'error',
                    title: 'Error',
                    message: response.message || 'Failed to send message. Please try again later.'
                });
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Error',
                message: 'An error occurred while sending your message. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <SEO
                title="Contact Us | BITC Mock Exams - Get in Touch for Support"
                description="Contact BITC Mock Exams for support, inquiries, or feedback. Reach us via phone, email, or our contact form. We're here to help with your Microsoft certification exam preparation."
                keywords="contact BITC Mock Exams, customer support, exam support, Microsoft certification help, contact us, get in touch, inquiry, feedback"
                canonical="https://www.bitcmockexams.com/contact"
                ogTitle="Contact Us | BITC Mock Exams"
                ogDescription="Get in touch with BITC Mock Exams team for any questions or support regarding Microsoft certification exam preparation."
                tweeterTitle="Contact Us | BITC Mock Exams"
                TweeterDes="Contact BITC Mock Exams for support with your Microsoft certification preparation."
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    "name": "Contact BITC Mock Exams",
                    "description": "Contact page for BITC Mock Exams - Microsoft Certification Practice Tests",
                    "url": "https://www.bitcmockexams.com/contact",
                    "mainEntity": {
                        "@type": "Organization",
                        "name": "BITC Mock Exams",
                        "url": "https://www.bitcmockexams.com",
                        "logo": "https://www.bitcmockexams.com/logo.png",
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+91-9347458388",
                            "contactType": "Customer Support",
                            "email": "support@bestitcourses.com",
                            "availableLanguage": ["English"],
                            "areaServed": "IN"
                        },
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "IN",
                            "addressRegion": "Telangana"
                        }
                    }
                }}
            />
            {/* Page Header */}
            <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4 text-white">Contact Us</h1>
                    <p className="text-xl text-white/90 max-w-[600px] mx-auto">
                        Get in touch with our team - we're here to help
                    </p>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div className="contact-form-section">
                            <h2 className="mb-4 text-2xl font-bold">Send Us a Message</h2>
                            <p className="text-text-secondary mb-8">
                                Fill out the form below and we'll get back to you within 24 hours.
                            </p>

                            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
                                <Input
                                    label="Full Name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.name}
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1">
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-text-primary mb-2">
                                                Country Code <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                                                aria-label="Country Code"
                                                required
                                                disabled={isLoadingCountries}
                                            >
                                                {countryCodes.map((country) => (
                                                    <option key={`${country.code}-${country.name}`} value={country.code}>
                                                        {country.code} {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 mt-1">
                                        <Input
                                            label="Phone Number"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.phone}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>
                                </div>

                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    required
                                />


                                <Input
                                    label="Message"
                                    type="textarea"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.message}
                                    rows={6}
                                    required
                                />

                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-text-primary mb-2">
                                        How did you find us? <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="howDidYouFindUs"
                                        value={formData.howDidYouFindUs}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                                        aria-label="How did you find us"
                                        required
                                    >
                                        <option value="">Select an option</option>
                                        <option value="Advertisement">Advertisement</option>
                                        <option value="Deccansoft Old Student">Deccansoft Old Student</option>
                                        <option value="Email">Email</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Google">Google</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Other">Other</option>
                                        <option value="Reference">Reference</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Website">Website</option>
                                        <option value="YouTube">YouTube</option>
                                    </select>
                                    {errors.howDidYouFindUs && (
                                        <p className="mt-1 text-sm text-red-500">{errors.howDidYouFindUs}</p>
                                    )}
                                </div>

                                {captchaError && (
                                    <p className="mb-4 text-sm text-red-500">{captchaError}</p>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    loading={isSubmitting}
                                    disabled={!isFormComplete() || isSubmitting}
                                >
                                    Send Message
                                </Button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="contact-info-section">
                            <h2 className="mb-4 text-2xl font-bold">Contact Information</h2>
                            <p className="text-text-secondary mb-8">
                                Reach out to us through any of the following channels
                            </p>

                            <div className="flex flex-col gap-6 mb-8">
                                {/* <div className="flex gap-6 p-6 bg-white rounded-lg shadow-sm transition-shadow duration-250 hover:shadow-md">
                                    <div className="w-[50px] h-[50px] bg-light-blue text-primary-blue rounded-md flex items-center justify-center text-2xl shrink-0">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="info-content">
                                        <h4 className="text-base font-bold mb-2">Address</h4>
                                        <p className="text-text-secondary m-0 leading-relaxed">H.No: 153, A/4,<br />Balamrai,<br />Rasoolpura,<br />Secunderabad-500003<br />TELANGANA, INDIA.</p>
                                    </div>
                                </div> */}

                                <div className="flex gap-6 p-6 bg-white rounded-lg shadow-sm transition-shadow duration-250 hover:shadow-md">
                                    <div className="w-[50px] h-[50px] bg-light-blue text-primary-blue rounded-md flex items-center justify-center text-2xl shrink-0">
                                        <FaPhone />
                                    </div>
                                    <div className="info-content">
                                        <h4 className="text-base font-bold mb-2">Mobile / WhatsApp</h4>
                                        <p className="text-text-secondary m-0 leading-relaxed">+91 9347458388</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 p-6 bg-white rounded-lg shadow-sm transition-shadow duration-250 hover:shadow-md">
                                    <div className="w-[50px] h-[50px] bg-light-blue text-primary-blue rounded-md flex items-center justify-center text-2xl shrink-0">
                                        <FaEnvelope />
                                    </div>
                                    <div className="info-content">
                                        <h4 className="text-base font-bold mb-2">Support Email</h4>
                                        <p className="text-text-secondary m-0 leading-relaxed">support@bestitcourses.com</p>
                                        <h4 className="text-base font-bold mt-4 mb-2">Contact Person</h4>
                                        <p className="text-text-secondary m-0 leading-relaxed"><strong>Mrs. Kashmira Shah</strong><br />Email: kashmira.shah@deccansoft.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 p-6 bg-white rounded-lg shadow-sm transition-shadow duration-250 hover:shadow-md">
                                    <div className="w-[50px] h-[50px] bg-light-blue text-primary-blue rounded-md flex items-center justify-center text-2xl shrink-0">
                                        <FaClock />
                                    </div>
                                    <div className="info-content">
                                        <h4 className="text-base font-bold mb-2">Business Hours</h4>
                                        <p className="text-text-secondary m-0 leading-relaxed">Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            {/* Google Map */}
                            <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.254686524798!2d78.48348631487717!3d17.447519988042586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9b761a1ab997%3A0x579d79a7010d05d6!2sDeccansoft%20Software%20Services!5e0!3m2!1sen!2sin!4v1661169831724!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Deccansoft Software Services Location"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal for success/error messages */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
            />
        </div>
    );
};

export default Contact;
