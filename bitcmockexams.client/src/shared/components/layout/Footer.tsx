import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';
const logoUrl = new URL('../../../assets/logo.png', import.meta.url).href;

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
                        <Link to="/" className="no-underline">
                            <img src={logoUrl} alt="Get Microsoft Certification" className="h-8 md:h-9 w-auto" />
                        </Link>
                        <p className="text-white/80 leading-relaxed mb-4">
                            Your trusted partner for cloud certification training, mock exams, and technology consulting services.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/DeccansoftAcademy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="Facebook">
                                <FaFacebookF />
                            </a>
                            <a href="https://x.com/deccansoft" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="https://www.instagram.com/best.it.courses" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="https://www.linkedin.com/showcase/bestitcourses" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="LinkedIn">
                                <FaLinkedinIn />
                            </a>
                            <a href="https://www.youtube.com/user/Deccansoft123" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="YouTube">
                                <FaYoutube />
                            </a>
                            <a href="https://api.whatsapp.com/send?phone=8555823343&text=Hello%20BestITCourses!" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 bg-white/10 text-white rounded-full transition-all duration-250 hover:bg-primary-blue hover:-translate-y-1" aria-label="WhatsApp">
                                <FaWhatsapp />
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
                        <ul className="list-none p-0 m-0 flex flex-col gap-2">
                            <li><Link to="/" className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">Home</Link></li>
                            <li><Link to="/about" className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">About Us</Link></li>
                            <li><Link to="/mock-exams" className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">Mock Exams</Link></li>
                            <li><Link to="/contact" className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold mb-4 text-white">Mock Exams</h4>
                        <ul className="list-none p-0 m-0 flex flex-col gap-2">
                            <li><Link to="/mock-exams?difficulty=beginner" onClick={() => window.scrollTo(0, 0)} className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">Fundamentals</Link></li>
                            <li><Link to="/mock-exams?difficulty=intermediate" onClick={() => window.scrollTo(0, 0)} className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">Role Based</Link></li>
                            <li><Link to="/mock-exams?difficulty=advanced" onClick={() => window.scrollTo(0, 0)} className="text-white/80 no-underline transition-all duration-200 hover:text-accent-blue hover:pl-2 inline-block">Speciality</Link></li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-lg font-bold mb-4 text-white">Contact Us</h4>
                        <ul className="list-none p-0 m-0 flex flex-col gap-4">
                            {/* <li className="flex gap-4 text-white/80 items-start">
                                <FaMapMarkerAlt className="text-primary-blue mt-1 shrink-0" />
                                <span>H.No: 153, A/4,<br />Balamrai,<br />Rasoolpura,<br />Secunderabad-500003<br />TELANGANA, INDIA.</span>
                            </li>
                            <li className="flex gap-4 text-white/80 items-start">
                                <FaPhone className="text-primary-blue mt-1 shrink-0" />
                                <span>+91 9347458388</span>
                            </li> */}
                            <li className="flex gap-4 text-white/80 items-start">
                                <FaEnvelope className="text-primary-blue mt-1 shrink-0" />
                                <a href="mailto:support@bestitcourses.com" className="text-white/80 no-underline hover:text-accent-blue transition-colors">support@bestitcourses.com</a>
                            </li>
                        </ul>

                        {/* <div className="mt-6">
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
                        </div> */}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-white/10 flex-wrap gap-4 md:flex-col md:text-center">
                    <div className="w-full flex flex-col items-center gap-2 text-center">
                        {/* <a href="https://www.deccansoft.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/80 no-underline">
                            <span>Proudly Powered by</span>
                            <img src="https://www.azurea2z.com/lib/assets/Images/Footer/Dss13.png" alt="DeccansoftLogo" className="h-6 object-contain" />
                        </a> */}
                    </div>
                    <p className="text-white/60 m-0">
                        © {currentYear} exam.getmicrosoftcertification. All rights reserved.
                    </p>
                    <div className="flex gap-4 items-center md:flex-wrap md:justify-center">
                        <a href="https://bdtmaterial.blob.core.windows.net/shared/WebsiteRewamp/Documents/NewprivacyagreementBITC.pdf" target="_blank" rel="noopener noreferrer" className="text-white/60 no-underline transition-colors duration-150 hover:text-accent-blue">Privacy Policy</a>
                        <span className="text-white/30">|</span>
                        <a href="https://bestitcourses-hgb4dhd3cmfnd5gn.z01.azurefd.net/shared/Blogs/termandconditions.pdf" target="_blank" rel="noopener noreferrer" className="text-white/60 no-underline transition-colors duration-150 hover:text-accent-blue">Terms and Conditions</a>
                        
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
