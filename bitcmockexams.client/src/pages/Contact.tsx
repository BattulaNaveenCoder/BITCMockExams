import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';
import Modal from '@shared/components/ui/Modal';
import { useContactApi } from '@shared/api/contact';

const countryCodes = [
    { code: '+93', name: 'Afghanistan' },
    { code: '+355', name: 'Albania' },
    { code: '+213', name: 'Algeria' },
    { code: '+1', name: 'United States' },
    { code: '+376', name: 'Andorra' },
    { code: '+244', name: 'Angola' },
    { code: '+54', name: 'Argentina' },
    { code: '+374', name: 'Armenia' },
    { code: '+61', name: 'Australia' },
    { code: '+43', name: 'Austria' },
    { code: '+994', name: 'Azerbaijan' },
    { code: '+973', name: 'Bahrain' },
    { code: '+880', name: 'Bangladesh' },
    { code: '+375', name: 'Belarus' },
    { code: '+32', name: 'Belgium' },
    { code: '+501', name: 'Belize' },
    { code: '+229', name: 'Benin' },
    { code: '+975', name: 'Bhutan' },
    { code: '+591', name: 'Bolivia' },
    { code: '+387', name: 'Bosnia and Herzegovina' },
    { code: '+267', name: 'Botswana' },
    { code: '+55', name: 'Brazil' },
    { code: '+673', name: 'Brunei' },
    { code: '+359', name: 'Bulgaria' },
    { code: '+226', name: 'Burkina Faso' },
    { code: '+257', name: 'Burundi' },
    { code: '+855', name: 'Cambodia' },
    { code: '+237', name: 'Cameroon' },
    { code: '+1', name: 'Canada' },
    { code: '+238', name: 'Cape Verde' },
    { code: '+236', name: 'Central African Republic' },
    { code: '+235', name: 'Chad' },
    { code: '+56', name: 'Chile' },
    { code: '+86', name: 'China' },
    { code: '+57', name: 'Colombia' },
    { code: '+269', name: 'Comoros' },
    { code: '+242', name: 'Congo' },
    { code: '+506', name: 'Costa Rica' },
    { code: '+385', name: 'Croatia' },
    { code: '+53', name: 'Cuba' },
    { code: '+357', name: 'Cyprus' },
    { code: '+420', name: 'Czech Republic' },
    { code: '+45', name: 'Denmark' },
    { code: '+253', name: 'Djibouti' },
    { code: '+593', name: 'Ecuador' },
    { code: '+20', name: 'Egypt' },
    { code: '+503', name: 'El Salvador' },
    { code: '+240', name: 'Equatorial Guinea' },
    { code: '+291', name: 'Eritrea' },
    { code: '+372', name: 'Estonia' },
    { code: '+251', name: 'Ethiopia' },
    { code: '+679', name: 'Fiji' },
    { code: '+358', name: 'Finland' },
    { code: '+33', name: 'France' },
    { code: '+241', name: 'Gabon' },
    { code: '+220', name: 'Gambia' },
    { code: '+995', name: 'Georgia' },
    { code: '+49', name: 'Germany' },
    { code: '+233', name: 'Ghana' },
    { code: '+30', name: 'Greece' },
    { code: '+502', name: 'Guatemala' },
    { code: '+224', name: 'Guinea' },
    { code: '+245', name: 'Guinea-Bissau' },
    { code: '+592', name: 'Guyana' },
    { code: '+509', name: 'Haiti' },
    { code: '+504', name: 'Honduras' },
    { code: '+852', name: 'Hong Kong' },
    { code: '+36', name: 'Hungary' },
    { code: '+354', name: 'Iceland' },
    { code: '+91', name: 'India' },
    { code: '+62', name: 'Indonesia' },
    { code: '+98', name: 'Iran' },
    { code: '+964', name: 'Iraq' },
    { code: '+353', name: 'Ireland' },
    { code: '+972', name: 'Israel' },
    { code: '+39', name: 'Italy' },
    { code: '+225', name: 'Ivory Coast' },
    { code: '+81', name: 'Japan' },
    { code: '+962', name: 'Jordan' },
    { code: '+7', name: 'Kazakhstan' },
    { code: '+254', name: 'Kenya' },
    { code: '+965', name: 'Kuwait' },
    { code: '+996', name: 'Kyrgyzstan' },
    { code: '+856', name: 'Laos' },
    { code: '+371', name: 'Latvia' },
    { code: '+961', name: 'Lebanon' },
    { code: '+266', name: 'Lesotho' },
    { code: '+231', name: 'Liberia' },
    { code: '+218', name: 'Libya' },
    { code: '+423', name: 'Liechtenstein' },
    { code: '+370', name: 'Lithuania' },
    { code: '+352', name: 'Luxembourg' },
    { code: '+853', name: 'Macau' },
    { code: '+389', name: 'Macedonia' },
    { code: '+261', name: 'Madagascar' },
    { code: '+265', name: 'Malawi' },
    { code: '+60', name: 'Malaysia' },
    { code: '+960', name: 'Maldives' },
    { code: '+223', name: 'Mali' },
    { code: '+356', name: 'Malta' },
    { code: '+222', name: 'Mauritania' },
    { code: '+230', name: 'Mauritius' },
    { code: '+52', name: 'Mexico' },
    { code: '+373', name: 'Moldova' },
    { code: '+377', name: 'Monaco' },
    { code: '+976', name: 'Mongolia' },
    { code: '+382', name: 'Montenegro' },
    { code: '+212', name: 'Morocco' },
    { code: '+258', name: 'Mozambique' },
    { code: '+95', name: 'Myanmar' },
    { code: '+264', name: 'Namibia' },
    { code: '+977', name: 'Nepal' },
    { code: '+31', name: 'Netherlands' },
    { code: '+64', name: 'New Zealand' },
    { code: '+505', name: 'Nicaragua' },
    { code: '+227', name: 'Niger' },
    { code: '+234', name: 'Nigeria' },
    { code: '+850', name: 'North Korea' },
    { code: '+47', name: 'Norway' },
    { code: '+968', name: 'Oman' },
    { code: '+92', name: 'Pakistan' },
    { code: '+970', name: 'Palestine' },
    { code: '+507', name: 'Panama' },
    { code: '+675', name: 'Papua New Guinea' },
    { code: '+595', name: 'Paraguay' },
    { code: '+51', name: 'Peru' },
    { code: '+63', name: 'Philippines' },
    { code: '+48', name: 'Poland' },
    { code: '+351', name: 'Portugal' },
    { code: '+974', name: 'Qatar' },
    { code: '+40', name: 'Romania' },
    { code: '+7', name: 'Russia' },
    { code: '+250', name: 'Rwanda' },
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+221', name: 'Senegal' },
    { code: '+381', name: 'Serbia' },
    { code: '+248', name: 'Seychelles' },
    { code: '+232', name: 'Sierra Leone' },
    { code: '+65', name: 'Singapore' },
    { code: '+421', name: 'Slovakia' },
    { code: '+386', name: 'Slovenia' },
    { code: '+252', name: 'Somalia' },
    { code: '+27', name: 'South Africa' },
    { code: '+82', name: 'South Korea' },
    { code: '+211', name: 'South Sudan' },
    { code: '+34', name: 'Spain' },
    { code: '+94', name: 'Sri Lanka' },
    { code: '+249', name: 'Sudan' },
    { code: '+597', name: 'Suriname' },
    { code: '+268', name: 'Swaziland' },
    { code: '+46', name: 'Sweden' },
    { code: '+41', name: 'Switzerland' },
    { code: '+963', name: 'Syria' },
    { code: '+886', name: 'Taiwan' },
    { code: '+992', name: 'Tajikistan' },
    { code: '+255', name: 'Tanzania' },
    { code: '+66', name: 'Thailand' },
    { code: '+228', name: 'Togo' },
    { code: '+216', name: 'Tunisia' },
    { code: '+90', name: 'Turkey' },
    { code: '+993', name: 'Turkmenistan' },
    { code: '+256', name: 'Uganda' },
    { code: '+380', name: 'Ukraine' },
    { code: '+971', name: 'United Arab Emirates' },
    { code: '+44', name: 'United Kingdom' },
    { code: '+598', name: 'Uruguay' },
    { code: '+998', name: 'Uzbekistan' },
    { code: '+58', name: 'Venezuela' },
    { code: '+84', name: 'Vietnam' },
    { code: '+967', name: 'Yemen' },
    { code: '+260', name: 'Zambia' },
    { code: '+263', name: 'Zimbabwe' }
];

const Contact = () => {
    const { submitContactForm } = useContactApi();
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
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({ isOpen: false, type: 'success', title: '', message: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
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
                } else if (!/^[0-9]{10,15}$/.test(value)) {
                    newErrors.phone = 'Phone number must be between 10 and 15 digits';
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
        } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be between 10 and 15 digits';
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

            const response = await submitContactForm(contactData);

            if (response.success) {
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
                                            <label className="block text-sm font-medium text-text-primary mb-2">
                                                Country Code <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
                                                required
                                            >
                                                {countryCodes.map((country) => (
                                                    <option key={`${country.code}-${country.name}`} value={country.code}>
                                                        {country.code} {country.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
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
                                    <label className="block text-sm font-medium text-text-primary mb-2">
                                        How did you find us? <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="howDidYouFindUs"
                                        value={formData.howDidYouFindUs}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all duration-200"
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
                                <div className="flex gap-6 p-6 bg-white rounded-lg shadow-sm transition-shadow duration-250 hover:shadow-md">
                                    <div className="w-[50px] h-[50px] bg-light-blue text-primary-blue rounded-md flex items-center justify-center text-2xl shrink-0">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="info-content">
                                        <h4 className="text-base font-bold mb-2">Address</h4>
                                        <p className="text-text-secondary m-0 leading-relaxed">H.No: 153, A/4,<br />Balamrai,<br />Rasoolpura,<br />Secunderabad-500003<br />TELANGANA, INDIA.</p>
                                    </div>
                                </div>

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
                                    style={{ border: 0 }}
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
