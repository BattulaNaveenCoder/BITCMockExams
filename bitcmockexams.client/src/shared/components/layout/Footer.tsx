import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Thank you for subscribing!');
        setEmail('');
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-text-primary text-white py-16 mt-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-2xl font-extrabold mb-2 text-white">BITC<span className="text-primary-blue">MockExams</span></h3>
                        <p className="text-white/80 leading-relaxed mb-4">
                            Your trusted partner for cloud certification training, mock exams, and technology consulting services.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="Facebook">
                                <FaFacebookF />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="LinkedIn">
                                <FaLinkedinIn />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="YouTube">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
                        <ul className="list-none p-0 m-0 flex flex-col gap-2">
                            <li><Link to="/" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">Home</Link></li>
                            <li><Link to="/about" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">About Us</Link></li>
                            <li><Link to="/mock-exams" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">Mock Exams</Link></li>
                            <li><Link to="/contact" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold mb-4 text-white">Mock Exams</h4>
                        <ul className="list-none p-0 m-0 flex flex-col gap-2">
                            <li><Link to="/mock-exams?difficulty=beginner" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">Fundamentals</Link></li>
                            <li><Link to="/mock-exams?difficulty=intermediate" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">Role Based</Link></li>
                            <li><Link to="/mock-exams?difficulty=advanced" className="text-white/80 no-underline transition-colors duration-150 hover:text-accent-blue hover:pl-2 inline-block">Speciality</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold mb-4 text-white">Contact Us</h4>
                        <ul className="list-none p-0 m-0 flex flex-col gap-4">
                            <li className="flex gap-4 text-white/80 items-start">
                                <FaMapMarkerAlt className="text-primary-blue mt-1 shrink-0" />
                                <span>123 Tech Street, Suite 100<br />San Francisco, CA 94105</span>
                            </li>
                            <li className="flex gap-4 text-white/80 items-start">
                                <FaPhone className="text-primary-blue mt-1 shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex gap-4 text-white/80 items-start">
                                <FaEnvelope className="text-primary-blue mt-1 shrink-0" />
                                <span>info@bitcmockexams.com</span>
                            </li>
                        </ul>

                        <div className="mt-6">
                            <h5 className="text-base font-semibold mb-4 text-white">Newsletter</h5>
                            <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                                <Input
                                    type="email"
                                    name="newsletter-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    required
                                    className="!mb-0 [&_input]:bg-white/10 [&_input]:border-white/20 [&_input]:text-white [&_input]:placeholder-white/50 [&_input:focus]:bg-white/15 [&_input:focus]:border-primary-blue"
                                />
                                <Button type="submit" variant="primary" size="small" fullWidth>
                                    Subscribe
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-white/10 flex-wrap gap-4 md:flex-col md:text-center">
                    <p className="text-white/60 m-0">
                        © {currentYear} BITCMockExams. All rights reserved.
                    </p>
                    <div className="flex gap-4 items-center md:flex-wrap md:justify-center">
                        <Link to="/privacy" className="text-white/60 no-underline transition-colors duration-150 hover:text-accent-blue">Privacy Policy</Link>
                        <span className="text-white/30">|</span>
                        <Link to="/terms" className="text-white/60 no-underline transition-colors duration-150 hover:text-accent-blue">Terms of Service</Link>
                        <span className="text-white/30">|</span>
                        <Link to="/cookies" className="text-white/60 no-underline transition-colors duration-150 hover:text-accent-blue">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
