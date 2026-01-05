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
        if (window.innerWidth >= 768) {
            if (mockHoverCloseTimer.current) {
                clearTimeout(mockHoverCloseTimer.current);
                mockHoverCloseTimer.current = null;
            }
            setMockMenuOpen(true);
        }
    };

    const handleMockLeave = () => {
        if (window.innerWidth >= 768) {
            if (mockHoverCloseTimer.current) {
                clearTimeout(mockHoverCloseTimer.current);
            }
            mockHoverCloseTimer.current = window.setTimeout(() => {
                setMockMenuOpen(false);
                mockHoverCloseTimer.current = null;
            }, 200); // small delay to allow moving into dropdown
        }
    };

    const handleCertEnter = () => {
        if (window.innerWidth >= 768) {
            if (certHoverCloseTimer.current) {
                clearTimeout(certHoverCloseTimer.current);
                certHoverCloseTimer.current = null;
            }
            setCertMenuOpen(true);
        }
    };

    const handleCertLeave = () => {
        if (window.innerWidth >= 768) {
            if (certHoverCloseTimer.current) {
                clearTimeout(certHoverCloseTimer.current);
            }
            certHoverCloseTimer.current = window.setTimeout(() => {
                setCertMenuOpen(false);
                setActiveSubmenu(null);
                certHoverCloseTimer.current = null;
            }, 200);
        }
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
        
        // Check for Data Engineering certifications FIRST (before Azure check)
        // DP courses contain "Azure" in title but should be categorized as Data Engineering
        if (upperCode.startsWith('DP-')) return 'Data Engineering';
        
        // Check for Power Platform certifications
        if (upperCode.startsWith('PL-')) return 'Power Platform';
        
        // Check for Security certifications
        if (upperCode.startsWith('SC-')) return 'Security';
        
        // Check for Docker certifications - should go to Miscellaneous
        if (upperCode.includes('DOCKER') || upperTitle.includes('DOCKER')) return 'Miscellaneous';
        
        // Check for Azure certifications - multiple patterns
        // This check comes AFTER DP- check to prevent DP courses from being categorized as Azure
        if (upperCode.startsWith('AZ-') || 
            upperCode.includes('AZURE') || 
            upperTitle.includes('AZURE')) return 'Azure';
        
        return 'Miscellaneous';
    };

    const getDifficultyLevel = (code: string, title: string): string => {
        // Extract clean code (remove any trailing characters after the exam number)
        const cleanCode = code.trim().toUpperCase().replace(/[:\s].*$/, '');
        
        // Exact same logic as MockExams.tsx
        const beginners = new Set([
            'AZ-900', 'DP-900', 'AI-900', 'PL-900'
        ]);
        
        const intermediates = new Set([
            // Azure Associate
            'AZ-104', 'AZ-204', 'AZ-500', 'AZ-700',
            // Data & AI Associate
            'DP-100', 'DP-203',
            // Power Platform Associate
            'PL-100', 'PL-200', 'PL-300', 'PL-400', 'PL-500',
            // Security Associate
            'SC-200', 'SC-300', 'SC-400',
            // Other
            'DOCKER CERTIFIED ASSOCIATE', 'SQL SERVER LIVE SESSION'
        ]);
        
        const advanced = new Set([
            'AZ-305', 'AZ-400', 'PL-600', 'AI-102'
        ]);

        // Direct code match
        if (beginners.has(cleanCode)) return 'Beginner';
        if (advanced.has(cleanCode)) return 'Advanced';
        if (intermediates.has(cleanCode)) return 'Intermediate';
        
        // Title-based special cases (matching MockExams.tsx)
        const upperTitle = title.trim().toUpperCase();
        if (/CHALLENGE/i.test(upperTitle) && /AZ-104/i.test(upperTitle)) return 'Intermediate';
        if (/DOCKER CERTIFIED ASSOCIATE/i.test(upperTitle)) return 'Intermediate';
        if (/SQL SERVER LIVE SESSION/i.test(upperTitle)) return 'Intermediate';
        
        // Fallback by prefix (matching MockExams.tsx)
        if (cleanCode.startsWith('AZ-900') || cleanCode.startsWith('DP-900') || 
            cleanCode.startsWith('AI-900') || cleanCode.startsWith('PL-900')) return 'Beginner';
        if (cleanCode.startsWith('AZ-305') || cleanCode.startsWith('AZ-400') || 
            cleanCode.startsWith('PL-600') || cleanCode.startsWith('AI-102')) return 'Advanced';
        
        return 'Intermediate';
    };

    const categorizedCourses = useMemo(() => {
        const categories: Record<string, Array<{title: string, code: string, pathId: string, difficulty: string}>> = {
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
                pathId: suite.PathId || '', // Use exact PathId from database for routing
                difficulty: getDifficultyLevel(code, title)
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
                        pathId: dbCourse.PathId || dpCode,
                        difficulty: getDifficultyLevel(dpCode, dbCourse.TestSuiteTitle || 'Data Engineering Certification')
                    });
                }
            }
        });

        // Sort all categories by difficulty: Beginner -> Intermediate -> Advanced
        const difficultyOrder: Record<string, number> = {
            'Beginner': 0,
            'Intermediate': 1,
            'Advanced': 2
        };
        
        Object.keys(categories).forEach(category => {
            categories[category].sort((a, b) => {
                // First sort by difficulty
                const diffOrder = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                if (diffOrder !== 0) return diffOrder;
                
                // If same difficulty, sort by code alphabetically
                return a.code.localeCompare(b.code);
            });
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
        // { path: '/about', label: 'About' },
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
                        <span className="text-2xl font-extrabold text-text-primary tracking-tighter"><span className="text-primary-blue">exam.getmicrosoftcertification</span></span>
                    </Link>

                    <nav id="primary-navigation" className={`fixed top-0 w-4/5 max-w-[320px] h-screen bg-white flex flex-col items-center p-6 pt-20 shadow-xl transition-all duration-250 gap-4 md:static md:w-auto md:max-w-none md:h-auto md:bg-transparent md:flex-row md:items-center md:p-0 md:shadow-none md:gap-8 ${isMobileMenuOpen ? 'right-0' : '-right-full'}`}>
                        <ul className="flex flex-col items-center gap-2 w-full list-none m-0 p-0 md:flex-row md:items-center md:gap-8 md:w-auto">
                            {navLinks.map((link) => {
                                const isMock = link.path === '/mock-exams';
                                const isCert = link.path === '/certification-exams';
                                
                                if (!isMock && !isCert) {
                                    return (
                                        <li key={link.path} className="relative w-full md:w-auto">
                                            <Link
                                                to={link.path}
                                                className={`block w-full py-3 text-center text-lg text-text-primary no-underline font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base md:text-left group ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                            >
                                                {link.label}
                                                <span className={`absolute bottom-0 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
                                                className={`block w-full py-3 text-center text-lg text-text-primary font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base md:text-left bg-transparent border-none cursor-pointer ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                                onClick={() => {
                                                    if (window.innerWidth < 768) {
                                                        setCertMenuOpen((o) => !o);
                                                    }
                                                }}
                                                aria-haspopup="menu"
                                                aria-controls="cert-dropdown"
                                            >
                                                {link.label}
                                                <span className={`absolute bottom-0 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0'}`}></span>
                                            </button>
                                            <div
                                                id="cert-dropdown"
                                                className={`static md:absolute left-0 md:left-auto md:right-0 md:top-full md:mt-2 w-full md:min-w-[280px] bg-white md:shadow-2xl md:border md:border-gray-200 overflow-visible transition-all duration-200 md:z-[1100] ${certMenuOpen ? 'block opacity-100 pointer-events-auto' : 'hidden md:block md:opacity-0 md:pointer-events-none'}`}
                                                onMouseEnter={handleCertEnter}
                                                onMouseLeave={handleCertLeave}
                                            >
                                                {['AI', 'Azure', 'Data Engineering', 'Power Platform', 'Security', 'Miscellaneous'].map((category) => {
                                                    const coursesInCategory = categorizedCourses[category] || [];
                                                    // Always show all categories to prevent loading flash
                                                    return (
                                                    <div key={category}>
                                                        <div
                                                            className="relative"
                                                            onMouseEnter={() => {
                                                                if (window.innerWidth >= 768) {
                                                                    console.log(`🎯 Hovering over ${category}, courses:`, categorizedCourses[category]?.length, categorizedCourses[category]);
                                                                    setActiveSubmenu(category);
                                                                }
                                                            }}
                                                            onMouseLeave={() => {
                                                                if (window.innerWidth >= 768) {
                                                                    console.log(`👋 Leaving ${category}`);
                                                                    setActiveSubmenu(null);
                                                                }
                                                            }}
                                                        >
                                                            <button
                                                                className="w-full text-left px-5 py-3.5 hover:bg-blue-100 bg-white border-none cursor-pointer flex items-center justify-between group transition-all duration-150 border-b border-gray-100"
                                                                onClick={(e) => { 
                                                                    console.log(`🖱️ Clicked ${category}, courses:`, categorizedCourses[category]);
                                                                    // On mobile, toggle submenu
                                                                    if (window.innerWidth < 768) {
                                                                        e.preventDefault();
                                                                        setActiveSubmenu(activeSubmenu === category ? null : category);
                                                                    } else {
                                                                        // On desktop, navigate to category page
                                                                        setCertMenuOpen(false); 
                                                                        setActiveSubmenu(null); 
                                                                        navigate(`/certification-exams?category=${encodeURIComponent(category)}`); 
                                                                    }
                                                                }}
                                                            >
                                                                <span className="flex-1 text-primary-blue group-hover:text-blue-700 font-medium text-sm transition-colors">
                                                                    {category} Certification Dumps
                                                                </span>
                                                                <span className={`text-base text-gray-400 group-hover:text-blue-700 ml-2 transition-all duration-200 md:rotate-0 ${activeSubmenu === category ? 'rotate-90' : ''}`}>›</span>
                                                            </button>
                                                            {categorizedCourses[category]?.length > 0 && activeSubmenu === category && (
                                                                <div 
                                                                    className="static md:absolute md:left-full md:top-0 w-full md:w-72 bg-gray-50 md:bg-white md:shadow-2xl md:border md:border-gray-200 overflow-hidden max-h-[400px] md:max-h-[500px] overflow-y-auto md:z-[1120] pl-4 md:pl-0"
                                                                    onMouseEnter={() => {
                                                                        console.log(`📋 Submenu showing for ${category}`);
                                                                        if (window.innerWidth >= 768) {
                                                                            setActiveSubmenu(category);
                                                                        }
                                                                    }}
                                                                    onMouseLeave={() => {
                                                                        console.log(`📋 Submenu closing for ${category}`);
                                                                        if (window.innerWidth >= 768) {
                                                                            setActiveSubmenu(null);
                                                                        }
                                                                    }}
                                                                >
                                                                    {categorizedCourses[category].map((course, courseIdx) => (
                                                                        <button
                                                                            key={course.pathId}
                                                                            className="w-full text-left px-4 md:px-5 py-3 md:py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 bg-transparent md:bg-white border-none cursor-pointer transition-all duration-150 border-b border-gray-200 last:border-b-0 group"
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
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div className="flex-1">
                                                                                    <div className="text-[11px] md:text-xs font-semibold text-primary-blue group-hover:text-gray-800 leading-snug transition-colors">{course.title}</div>
                                                                                </div>
                                                                                <span className={`text-[9px] md:text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                                                                    course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                                                                    course.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                                                                                    'bg-purple-100 text-purple-700'
                                                                                }`}>
                                                                                    {course.difficulty}
                                                                                </span>
                                                                            </div>
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
                                            className={`block w-full py-3 text-center text-lg text-text-primary font-medium transition-colors duration-150 relative hover:text-primary-blue md:inline-block md:w-auto md:py-2 md:text-base md:text-left bg-transparent border-none cursor-pointer ${isActive(link.path) ? 'text-primary-blue' : ''}`}
                                            onClick={() => {
                                                if (window.innerWidth < 768) {
                                                    setMockMenuOpen((o) => !o);
                                                }
                                            }}
                                            aria-haspopup="menu"
                                            aria-controls="mock-dropdown"
                                        >
                                            {link.label}
                                            <span className={`absolute bottom-0 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 h-0.5 bg-primary-blue transition-all duration-250 ${isActive(link.path) ? 'w-full' : 'w-0'}`}></span>
                                        </button>
                                        {/* Dropdown: visible when mockMenuOpen */}
                                        <div
                                            id="mock-dropdown"
                                            className={`static md:absolute left-0 md:left-auto md:right-0 md:top-full md:mt-2 w-full md:w-56 bg-white md:rounded-xl md:shadow-xl md:border md:border-border overflow-hidden transition-opacity duration-200 md:z-[1100] ${mockMenuOpen ? 'block opacity-100 pointer-events-auto' : 'hidden md:block md:opacity-0 md:pointer-events-none'}`}
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

                        <div className="flex flex-col w-full items-center gap-3 mt-6 pt-6 border-t border-border md:flex-row md:w-auto md:gap-4 md:mt-0 md:pt-0 md:border-t-0 md:items-stretch">
                            {!isAuthenticated ? (
                                <a target="_blank" rel="noopener noreferrer" onClick={() => open(location.pathname + location.search + location.hash)} className="w-full max-w-[200px] md:max-w-none md:w-auto">
                                    <Button variant="primary" size="small" className="w-full md:w-auto">Login</Button>
                                </a>
                            ) : (
                                <div className="relative w-full md:w-auto flex justify-center md:justify-start">
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
                                                onClick={() => {
                                                    setMenuOpen(false);
                                                    navigate('/dashboard');
                                                }}
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
