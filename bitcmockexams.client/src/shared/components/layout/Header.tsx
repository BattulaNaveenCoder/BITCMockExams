/* eslint-disable jsx-a11y/aria-proptypes */
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import { useLoginModal } from '@features/auth/context/LoginModalContext';
import { useAuth } from '@features/auth/context/AuthContext';
import { FaChartBar, FaWallet, FaLock, FaPowerOff } from 'react-icons/fa';
import { useTestSuites } from '@shared/contexts/TestSuitesContext';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { open } = useLoginModal();
    const { isAuthenticated, user, logout, displayName } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mockMenuOpen, setMockMenuOpen] = useState(false);
    const [certMenuOpen, setCertMenuOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const mockHoverCloseTimer = useRef<number | null>(null);
    const certHoverCloseTimer = useRef<number | null>(null);
    
    // Use shared context instead of making individual API calls
    const { suites, loading } = useTestSuites();

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

    const handleCertEnter = () => {
        if (certHoverCloseTimer.current) {
            clearTimeout(certHoverCloseTimer.current);
            certHoverCloseTimer.current = null;
        }
        setCertMenuOpen(true);
    };

    const handleCertLeave = () => {
        if (certHoverCloseTimer.current) {
            clearTimeout(certHoverCloseTimer.current);
        }
        certHoverCloseTimer.current = window.setTimeout(() => {
            setCertMenuOpen(false);
            certHoverCloseTimer.current = null;
        }, 200);
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

    const getCategoryFromCode = (code: string, title?: string): string => {
        const upperCode = code.toUpperCase();
        const upperTitle = (title || '').toUpperCase();
        
        // Check for AI certifications
        if (upperCode.startsWith('AI-')) return 'AI';
        
        // Check for Azure certifications - multiple patterns
        if (upperCode.startsWith('AZ-') || 
            upperCode.includes('AZURE') || 
            upperCode.includes('DOCKER') ||
            upperTitle.includes('AZURE')) return 'Azure';
        
        // Check for Data Engineering certifications
        if (upperCode.startsWith('DP-')) return 'Data Engineering';
        
        // Check for Power Platform certifications
        if (upperCode.startsWith('PL-')) return 'Power Platform';
        
        // Check for Security certifications
        if (upperCode.startsWith('SC-')) return 'Security';
        
        return 'Miscellaneous';
    };

    const categorizedCourses = useMemo(() => {
        const categories: Record<string, Array<{title: string, code: string, pathId: string}>> = {
            'AI': [],
            'Azure': [],
            'Data Engineering': [],
            'Power Platform': [],
            'Security': [],
            'Miscellaneous': []
        };

        // Only process if suites data is available
        if (!suites || suites.length === 0) {
            console.log('⚠️ Header: No suites available yet, returning empty categories');
            return categories;
        }

        // Populate all categories from database suites
        suites.forEach(suite => {
            const code = (suite.PathId || '').split(':')[0] || 'EXAM';
            const title = suite.TestSuiteTitle || 'Untitled Exam';
            const category = getCategoryFromCode(code, title);
            
            // Debug DP courses specifically
            if (code.toUpperCase().startsWith('DP-')) {
                console.log('🔍 Found DP course:', {
                    code,
                    title,
                    pathId: suite.PathId,
                    category,
                    fullSuite: suite
                });
            }
            
            categories[category].push({
                title,
                code,
                pathId: suite.PathId || '' // Use exact PathId from database for routing
            });
        });

        // Ensure Data Engineering submenu always shows priority courses (DP-900, DP-203, DP-100)
        const priorityDPCodes = ['DP-900', 'DP-203', 'DP-100'];
        priorityDPCodes.forEach(dpCode => {
            // Check if this DP course already exists in categories
            const exists = categories['Data Engineering'].some(course => course.code === dpCode);
            if (!exists) {
                // Find in database to get actual PathId
                const dbCourse = suites.find(s => s.PathId?.startsWith(dpCode + ':'));
                if (dbCourse) {
                    // Add with actual database PathId for correct routing
                    categories['Data Engineering'].push({
                        title: dbCourse.TestSuiteTitle || 'Data Engineering Certification',
                        code: dpCode,
                        pathId: dbCourse.PathId || dpCode
                    });
                }
            }
        });

        // Sort Data Engineering courses by priority
        const dpPriority = ['DP-900', 'DP-203', 'DP-100'];
        categories['Data Engineering'].sort((a, b) => {
            const aIndex = dpPriority.indexOf(a.code);
            const bIndex = dpPriority.indexOf(b.code);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return 0;
        });

        // Debug logging
        console.log('📊 Header Categories Debug:', {
            totalSuites: suites.length,
            dataEngineeringCount: categories['Data Engineering'].length,
            dataEngineeringCourses: categories['Data Engineering'],
            allCategories: Object.keys(categories).map(cat => ({
                category: cat,
                count: categories[cat].length
            }))
        });

        return categories;
    }, [suites]);

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/certification-exams', label: 'Certifications' },
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
                                const isCert = link.path === '/certification-exams';
                                
                                if (!isMock && !isCert) {
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
                                
                                if (isCert) {
                                    return (
                                        <li
                                            key={link.path}
                                            className="relative w-full md:w-auto"
                                            onMouseEnter={handleCertEnter}
                                            onMouseLeave={handleCertLeave}
                                        >
                                            <button
                                                type="button"
                                                className={`block w-full py-3 text-lg text-text-primary font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base bg-transparent border-none cursor-pointer ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                                onClick={() => setCertMenuOpen((o) => !o)}
                                                aria-haspopup="menu"
                                                aria-controls="cert-dropdown"
                                            >
                                                {link.label}
                                                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0'}`}></span>
                                            </button>
                                            <div
                                                id="cert-dropdown"
                                                className={`absolute left-0 md:left-auto md:right-0 top-full mt-2 min-w-[280px] bg-white shadow-2xl border border-gray-200 overflow-visible transition-all duration-200 z-[1100] ${certMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                                onMouseEnter={handleCertEnter}
                                                onMouseLeave={handleCertLeave}
                                            >
                                                {['AI', 'Azure', 'Data Engineering', 'Power Platform', 'Security', 'Miscellaneous'].map((category) => {
                                                    const coursesInCategory = categorizedCourses[category] || [];
                                                    // Only show categories that have courses or are priority categories
                                                    const isPriorityCategory = ['Azure', 'Data Engineering', 'AI'].includes(category);
                                                    if (coursesInCategory.length === 0 && !isPriorityCategory) {
                                                        return null;
                                                    }
                                                    return (
                                                    <div key={category}>
                                                        <div
                                                            className="relative"
                                                            onMouseEnter={() => {
                                                                console.log(`🎯 Hovering over ${category}, courses:`, categorizedCourses[category]?.length, categorizedCourses[category]);
                                                                setActiveSubmenu(category);
                                                            }}
                                                            onMouseLeave={() => {
                                                                console.log(`👋 Leaving ${category}`);
                                                                setActiveSubmenu(null);
                                                            }}
                                                        >
                                                            <button
                                                                className="w-full text-left px-5 py-3.5 hover:bg-blue-100 bg-white border-none cursor-pointer flex items-center justify-between group transition-all duration-150 border-b border-gray-100"
                                                                onClick={() => { 
                                                                    console.log(`🖱️ Clicked ${category}, courses:`, categorizedCourses[category]);
                                                                    setCertMenuOpen(false); 
                                                                    setActiveSubmenu(null); 
                                                                    navigate(`/certification-exams?category=${encodeURIComponent(category)}`); 
                                                                }}
                                                            >
                                                                <span className="flex-1 text-primary-blue group-hover:text-blue-700 font-medium text-sm transition-colors">
                                                                    {category} Certification Dumps
                                                                </span>
                                                                {categorizedCourses[category]?.length > 0 && (
                                                                    <span className="text-base text-gray-400 group-hover:text-blue-700 ml-2 transition-colors">›</span>
                                                                )}
                                                            </button>
                                                            {categorizedCourses[category]?.length > 0 && activeSubmenu === category && (
                                                                <div 
                                                                    className="absolute left-full top-0 w-72 bg-white shadow-2xl border border-gray-200 overflow-hidden max-h-[500px] overflow-y-auto z-[1120]"
                                                                    onMouseEnter={() => {
                                                                        console.log(`📋 Submenu showing for ${category}`);
                                                                        setActiveSubmenu(category);
                                                                    }}
                                                                    onMouseLeave={() => {
                                                                        console.log(`📋 Submenu closing for ${category}`);
                                                                        setActiveSubmenu(null);
                                                                    }}
                                                                >
                                                                    {categorizedCourses[category].map((course, courseIdx) => (
                                                                        <button
                                                                            key={course.pathId}
                                                                            className="w-full text-left px-5 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 bg-white border-none cursor-pointer transition-all duration-150 border-b border-gray-100 last:border-b-0 group"
                                                                            onClick={() => {
                                                                                setCertMenuOpen(false);
                                                                                setActiveSubmenu(null);
                                                                                setIsMobileMenuOpen(false);
                                                                                
                                                                                // Check authentication before routing (same as ExamCard)
                                                                                const pathId = course.pathId;
                                                                                const returnUrl = `/exams/${pathId}`;
                                                                                
                                                                                if (isAuthenticated === false) {
                                                                                    open(returnUrl);
                                                                                    return;
                                                                                }
                                                                                
                                                                                if (isAuthenticated === null) return;
                                                                                
                                                                                navigate(returnUrl);
                                                                            }}
                                                                        >
                                                                            <div className="font-semibold text-primary-blue group-hover:text-blue-700 text-sm leading-tight transition-colors">{course.code}</div>
                                                                            <div className="text-xs text-gray-600 group-hover:text-gray-800 mt-1.5 leading-snug transition-colors">{course.title}</div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        </li>
                                    );
                                }
                                
                                if (isMock) {
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
                                }
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
