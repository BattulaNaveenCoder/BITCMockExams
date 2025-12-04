import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Button from '../ui/Button';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/mock-exams', label: 'Mock Exams' },
        { path: '/contact', label: 'Contact' }
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className={`sticky top-0 left-0 right-0 z-[1000] bg-white transition-all duration-250 border-b ${isScrolled ? 'shadow-md border-border' : 'border-transparent'}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                    <Link to="/" className="flex items-center no-underline z-[1001]">
                        <span className="text-2xl font-extrabold text-text-primary tracking-tighter">BITC<span className="text-primary-blue">MockExams</span></span>
                    </Link>

                    <nav className={`fixed top-0 w-4/5 max-w-[300px] h-screen bg-white flex flex-col items-start p-8 pt-20 shadow-xl transition-all duration-250 gap-4 md:static md:w-auto md:max-w-none md:h-auto md:bg-transparent md:flex-row md:items-center md:p-0 md:shadow-none md:gap-8 ${isMobileMenuOpen ? 'right-0' : '-right-full'}`}>
                        <ul className="flex flex-col items-start gap-4 w-full list-none m-0 p-0 md:flex-row md:items-center md:gap-8 md:w-auto">
                            {navLinks.map((link) => (
                                <li key={link.path} className="relative w-full md:w-auto">
                                    <Link
                                        to={link.path}
                                        className={`block w-full py-3 text-lg text-text-primary no-underline font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base group ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                    >
                                        {link.label}
                                        <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="flex flex-col w-full gap-3 mt-4 pt-4 border-t border-border md:flex-row md:w-auto md:gap-4 md:mt-0 md:pt-0 md:border-t-0">
                            <Link to="/login" className="w-full md:w-auto">
                                <Button variant="ghost" size="small" className="w-full md:w-auto">Login</Button>
                            </Link>
                            <a href="https://www.bestitcourses.com/" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                                <Button variant="primary" size="small" className="w-full md:w-auto">Sign Up</Button>
                            </a>
                        </div>
                    </nav>

                    <button
                        className="block md:hidden bg-transparent border-none text-2xl text-text-primary cursor-pointer z-[1001] p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
