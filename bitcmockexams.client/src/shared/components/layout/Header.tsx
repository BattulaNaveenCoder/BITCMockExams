/* eslint-disable jsx-a11y/aria-proptypes */
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import { useLoginModal } from '@features/auth/context/LoginModalContext';
import { useAuth } from '@features/auth/context/AuthContext';
import { FaChartBar, FaWallet, FaLock, FaPowerOff } from 'react-icons/fa';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { open } = useLoginModal();
    const { isAuthenticated, user, logout, displayName } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mockMenuOpen, setMockMenuOpen] = useState(false);
    const mockHoverCloseTimer = useRef<number | null>(null);

    const handleMockEnter = () => {
        if (mockHoverCloseTimer.current) {
            clearTimeout(mockHoverCloseTimer.current);
            mockHoverCloseTimer.current = null;
        }
        setMockMenuOpen(true);
    };

    const handleMockLeave = () => {
        if (mockHoverCloseTimer.current) {
            clearTimeout(mockHoverCloseTimer.current);
        }
        mockHoverCloseTimer.current = window.setTimeout(() => {
            setMockMenuOpen(false);
            mockHoverCloseTimer.current = null;
        }, 200); // small delay to allow moving into dropdown
    };

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

                    <nav id="primary-navigation" className={`fixed top-0 w-4/5 max-w-[300px] h-screen bg-white flex flex-col items-start p-8 pt-20 shadow-xl transition-all duration-250 gap-4 md:static md:w-auto md:max-w-none md:h-auto md:bg-transparent md:flex-row md:items-center md:p-0 md:shadow-none md:gap-8 ${isMobileMenuOpen ? 'right-0' : '-right-full'}`}>
                        <ul className="flex flex-col items-start gap-4 w-full list-none m-0 p-0 md:flex-row md:items-center md:gap-8 md:w-auto">
                            {navLinks.map((link) => {
                                const isMock = link.path === '/mock-exams';
                                if (!isMock) {
                                    return (
                                        <li key={link.path} className="relative w-full md:w-auto">
                                            <Link
                                                to={link.path}
                                                className={`block w-full py-3 text-lg text-text-primary no-underline font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base group ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                            >
                                                {link.label}
                                                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                            </Link>
                                        </li>
                                    );
                                }
                                return (
                                    <li
                                        key={link.path}
                                        className="relative w-full md:w-auto"
                                        onMouseEnter={handleMockEnter}
                                        onMouseLeave={handleMockLeave}
                                    >
                                        {/* Trigger: do not navigate on click, just toggle dropdown */}
                                        <button
                                            type="button"
                                            className={`block w-full py-3 text-lg text-text-primary font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base bg-transparent border-none cursor-pointer ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                            onClick={() => setMockMenuOpen((o) => !o)}
                                            aria-haspopup="menu"
                                            aria-controls="mock-dropdown"
                                        >
                                            {link.label}
                                            <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0'}`}></span>
                                        </button>
                                        {/* Dropdown: visible when mockMenuOpen */}
                                        <div
                                            id="mock-dropdown"
                                            className={`absolute left-0 md:left-auto md:right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border overflow-hidden transition-opacity duration-200 z-[1100] ${mockMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                            onMouseEnter={handleMockEnter}
                                            onMouseLeave={handleMockLeave}
                                        >
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-light-blue bg-transparent border-none cursor-pointer"
                                                onClick={() => { setMockMenuOpen(false); navigate('/mock-exams?difficulty=Beginner'); }}
                                            >
                                                Beginner Certifications
                                            </button>
                                            <div className="h-px bg-border" />
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-light-blue bg-transparent border-none cursor-pointer"
                                                onClick={() => { setMockMenuOpen(false); navigate('/mock-exams?difficulty=Intermediate'); }}
                                            >
                                                Intermediate Certifications
                                            </button>
                                            <div className="h-px bg-border" />
                                            <button
                                                className="w-full text-left px-4 py-3 hover:bg-light-blue bg-transparent border-none cursor-pointer"
                                                onClick={() => { setMockMenuOpen(false); navigate('/mock-exams?difficulty=Advanced'); }}
                                            >
                                                Advanced Certifications
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div className="flex flex-col w-full gap-3 mt-4 pt-4 border-t border-border md:flex-row md:w-auto md:gap-4 md:mt-0 md:pt-0 md:border-t-0">
                            {!isAuthenticated ? (
                                <a target="_blank" rel="noopener noreferrer" onClick={() => open(location.pathname + location.search + location.hash)} className="w-full md:w-auto">
                                    <Button variant="primary" size="small" className="w-full md:w-auto">Login</Button>
                                </a>
                            ) : (
                                <div className="relative">
                                    <button
                                        className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-text-primary font-semibold"
                                        onClick={() => setMenuOpen((o) => !o)}
                                        aria-haspopup="menu"
                                        aria-controls="user-menu"
                                    >
                                        {(() => {
                                            const emailClaim = (user as any)?.emailaddress || (user as any)?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
                                            const nameClaim = (user as any)?.name || (user as any)?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
                                            const fallback = emailClaim ? String(emailClaim).split('@')[0] : (nameClaim || 'User');
                                            const text = displayName || fallback;
                                            return `Hello, ${text}`;
                                        })()}
                                        <span className={`inline-block transition-transform ${menuOpen ? 'rotate-180' : 'rotate-0'}`}>▾</span>
                                    </button>
                                    {menuOpen && (
                                        <div id="user-menu" className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-[1100]">
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-blue bg-transparent border-none cursor-pointer"
                                                onMouseDown={() => { setMenuOpen(false); navigate('/dashboard'); }}
                                            >
                                                <FaChartBar className="text-text-secondary" />
                                                <span>DashBoard</span>
                                            </button>
                                            
                                            <div className="h-px bg-border" />
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-blue bg-transparent border-none cursor-pointer"
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    logout();
                                                    navigate('/');
                                                    open('/');
                                                }}
                                            >
                                                <FaPowerOff className="text-text-secondary" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </nav>

                    <button
                        className="block md:hidden bg-transparent border-none text-2xl text-text-primary cursor-pointer z-[1001] p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        aria-controls="primary-navigation"
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
