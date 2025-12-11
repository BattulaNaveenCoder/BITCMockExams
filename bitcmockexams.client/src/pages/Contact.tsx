import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setIsSubmitting(false);
        }, 1500);
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
                                    error={errors.name}
                                    required
                                />

                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    required
                                />

                                <Input
                                    label="Subject"
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    error={errors.subject}
                                    required
                                />

                                <Input
                                    label="Message"
                                    type="textarea"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    error={errors.message}
                                    rows={6}
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    loading={isSubmitting}
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
                                        <p className="text-text-secondary m-0 leading-relaxed">azurea2z@deccansoft.net</p>
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
        </div>
    );
};

export default Contact;
