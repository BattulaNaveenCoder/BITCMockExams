import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaStar, FaServer, FaDatabase, FaLightbulb, FaUsers, FaThLarge, FaShieldAlt } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Card from '@shared/components/ui/Card';
import { mockExams, testimonials, stats } from '../data/mockData';
import { useTestSuitesApi, type TestSuite } from '@shared/api/testSuites';
import { useEffect, useRef, useState } from 'react';
import type { Testimonial } from '../types';

const Home = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeResultIndex, setActiveResultIndex] = useState(0);
    const [remoteResults, setRemoteResults] = useState<TestSuite[]>([]);
    const { globalSearch } = useTestSuitesApi();
    const globalSearchRef = useRef(globalSearch);
    useEffect(() => { globalSearchRef.current = globalSearch; }, [globalSearch]);
    const normalized = (s: string) => s.toLowerCase();
    // Prefer remote global search when query length >= 2; otherwise fallback to local
    const localResults = mockExams
        .filter(exam => {
            const q = normalized(search);
            if (!q) return false;
            return (
                normalized(exam.title).includes(q) ||
                normalized(exam.code).includes(q) ||
                normalized(exam.category).includes(q)
            );
        })
        .slice(0, 20);
    const searchResults = (search.trim().length >= 2 && remoteResults.length > 0) ? remoteResults : localResults;

    useEffect(() => {
        let mounted = true;
        const q = search.trim();
        if (q.length < 2) { setRemoteResults([]); return; }
        const handle = window.setTimeout(async () => {
            try {
                const data = await globalSearchRef.current(q, 0, 20);
                if (mounted) setRemoteResults(data);
            } catch {
                if (mounted) setRemoteResults([]);
            }
        }, 250);
        return () => { mounted = false; window.clearTimeout(handle); };
    }, [search]);

    const extractCode = (item: TestSuite | null): string | null => {
        if (!item) return null;
        // Try to read code from title prefix like "AZ-104: ..."
        const t = item.TestSuiteTitle || '';
        const m = t.match(/^[A-Z]+-\d{2,3}/);
        if (m) return m[0];
        // Fallback: find code inside title
        const m2 = t.match(/[A-Z]+-\d{2,3}/);
        if (m2) return m2[0];
        return null;
    };
    const featuredCodes = ['AZ-900','AI-900','DP-900', 'PL-900','AZ-104','AZ-204'];
    const badgeByCategory: Record<string, string> = {
        Fundamentals: 'https://www.getmicrosoftcertification.com/lib/images/fundamentals.png',
        'Role-Based': 'https://www.getmicrosoftcertification.com/lib/images/expert.png',
        Speciality: 'https://www.getmicrosoftcertification.com/lib/images/associate.png'
    };
    const featuredExams = mockExams.filter(exam => featuredCodes.includes(exam.code));
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="relative min-h-[400px] display flex items-center justify-center bg-gradient-to-br from-primary-blue via-secondary-blue to-dark-blue text-white md:min-h-[300px]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/90 to-secondary-blue/80"></div>
                <div className="container mx-auto px-4 relative z-[100] py-16">
                    <div className="max-w-[800px] animate-fadeIn text-center mx-auto">
                        {/* <h1 className="text-5xl font-extrabold mb-6 leading-tight text-white md:text-3xl">
                            Transform Your Cloud Journey
                        </h1>
                        <p className="text-xl mb-12 leading-relaxed text-white/95 md:text-base">
                            Master cloud certifications with expert-led training, comprehensive mock exams,
                            and personalized guidance. Join 50,000+ successful students worldwide.
                        </p> */}
                        {/* Global Search */}
                        <div className={`relative max-w-[800px] mx-auto mb-8`}>
                            <div className="flex items-center bg-white rounded-2xl shadow-md overflow-hidden ring-2 ring-primary-blue/50">
                                <div className="pl-4 pr-2 text-primary-blue text-xl" aria-hidden="true">🔍</div>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); setActiveResultIndex(0); }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    placeholder="Search by certification, exam voucher and exam dumps"
                                    className="w-full px-4 py-3 text-text-primary outline-none"
                                    aria-label="Global search"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const q = search.trim();
                                            if (!q) return;
                                            const exact = mockExams.find(m => m.code.toLowerCase() === q.toLowerCase() || m.title.toLowerCase() === q.toLowerCase());
                                            if (exact) navigate(`/mock-exams?code=${encodeURIComponent(exact.code)}`);
                                            else navigate(`/mock-exams?q=${encodeURIComponent(q)}`);
                                        }
                                        if (e.key === 'ArrowDown') {
                                            e.preventDefault();
                                            setActiveResultIndex(i => Math.min(i + 1, Math.max(searchResults.length - 1, 0)));
                                        }
                                        if (e.key === 'ArrowUp') {
                                            e.preventDefault();
                                            setActiveResultIndex(i => Math.max(i - 1, 0));
                                        }
                                    }}
                                />
                                <button
                                    className="px-5 py-3 bg-primary-blue text-white font-semibold"
                                    onClick={() => {
                                        const q = search.trim();
                                        if (!q) return;
                                        const exact = mockExams.find(m => m.code.toLowerCase() === q.toLowerCase() || m.title.toLowerCase() === q.toLowerCase());
                                        if (exact) navigate(`/mock-exams?code=${encodeURIComponent(exact.code)}`);
                                        else navigate(`/mock-exams?q=${encodeURIComponent(q)}`);
                                    }}
                                >Search</button>
                            </div>
                            {showSuggestions && searchResults.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-auto max-h-[70vh] md:max-h-[60vh] z-[3000] overscroll-contain">
                                    {searchResults.map((item: any, idx) => (
                                        <button
                                            key={(item.id || item.PKTestSuiteId)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-light-blue ${idx === activeResultIndex ? 'bg-light-blue' : ''}`}
                                            onMouseDown={() => {
                                                const code = extractCode(item as TestSuite) || (item.code as string) || '';
                                                if (code) navigate(`/mock-exams?code=${encodeURIComponent(code)}`);
                                                else navigate(`/mock-exams?q=${encodeURIComponent(search.trim())}`);
                                            }}
                                        >
                                            <img
                                                src={(item.ImageTestsuiteUrl as string) || badgeByCategory[item.category] || badgeByCategory['Fundamentals']}
                                                alt={(item.category ? `${item.category} badge` : 'Exam badge')}
                                                className="w-8 h-8 rounded-full object-contain shrink-0"
                                            />
                                            <div>
                                                <div className="text-primary-blue font-semibold">{(item.title || (item as TestSuite).TestSuiteTitle)}</div>
                                                {/* <div className="text-text-secondary text-sm">{item.description || (item as TestSuite).FKContributorName}</div> */}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col mb-8 md:flex-row gap-6 flex-wrap justify-center items-center">
                            <Link to="/mock-exams">
                                <Button variant="secondary" size="large" icon={<FaArrowRight />}>
                                    Explore Mock Exams
                                </Button>
                            </Link>
                            {/* <Link to="/services">
                                <Button variant="secondary" size="large">
                                    View Services
                                </Button>
                            </Link> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-12 -mt-12 relative z-0">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
                        {stats.map((stat, index) => (
                            <AnimatedStat key={index} label={stat.label} value={stat.value} />
                        ))}
                    </div>
                </div>
            </section>
            


            {/* Microsoft Certifications */}
            <section className="py-16 bg-bg-light">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Microsoft Certification Exams</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            Practice with real exam scenarios and boost your confidence
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-stretch">
                        <Link to="/mock-exams?difficulty=Beginner" className="block h-full">
                        <div className="bg-white border border-border rounded-lg p-8 shadow-sm cursor-pointer h-full flex flex-col">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-bg-light md:gap-4">
                                <div>
                                    <h3 className="text-2xl text-primary-blue m-0 mb-1 font-bold">FUNDAMENTALS</h3>
                                    <button
                                        type="button"
                                        className="text-primary-blue text-sm m-0 underline cursor-pointer bg-transparent border-none p-0"
                                        onClick={(e) => { e.stopPropagation(); navigate('/mock-exams'); }}
                                    >
                                        Master the basics
                                    </button>
                                </div>
                                <img
                                    src="https://www.getmicrosoftcertification.com/lib/images/fundamentals.png"
                                    alt="Microsoft Certified Fundamentals"
                                    className="w-[60px] h-[60px] object-contain shrink-0 drop-shadow-sm md:self-center"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {mockExams.filter(exam => exam.category === 'Fundamentals').map((exam) => (
                                    <div key={exam.id} className="flex items-baseline gap-1 leading-relaxed">
                                        <span className="font-bold text-text-primary text-base whitespace-nowrap">{exam.code}</span>
                                        <span className="text-text-secondary font-normal">:</span>
                                        <span className="text-text-secondary text-base">{exam.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </Link>

                        <Link to="/mock-exams?difficulty=Intermediate" className="block h-full">
                        <div className="bg-white border border-border rounded-lg p-8 shadow-sm cursor-pointer h-full flex flex-col">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-bg-light md:gap-4">
                                <div>
                                    <h3 className="text-2xl text-primary-blue m-0 mb-1 font-bold">ROLE-BASED</h3>
                                    <button
                                        type="button"
                                        className="text-primary-blue text-sm m-0 underline cursor-pointer bg-transparent border-none p-0"
                                        onClick={(e) => { e.stopPropagation(); navigate('/mock-exams'); }}
                                    >
                                        Expand your technical skill set
                                    </button>
                                </div>
                                <img
                                    src="https://www.getmicrosoftcertification.com/lib/images/expert.png"
                                    alt="Microsoft Certified Expert"
                                    className="w-[60px] h-[60px] object-contain shrink-0 drop-shadow-sm md:self-center"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {mockExams.filter(exam => exam.category === 'Role-Based').map((exam) => (
                                    <div key={exam.id} className="flex items-baseline gap-1 leading-relaxed">
                                        <span className="font-bold text-text-primary text-base whitespace-nowrap">{exam.code}</span>
                                        <span className="text-text-secondary font-normal">:</span>
                                        <span className="text-text-secondary text-base">{exam.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </Link>

                        <Link to="/mock-exams?difficulty=Advanced" className="block h-full">
                        <div className="bg-white border border-border rounded-lg p-8 shadow-sm cursor-pointer h-full flex flex-col">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-bg-light md:gap-4">
                                <div>
                                    <h3 className="text-2xl text-primary-blue m-0 mb-1 font-bold">SPECIALITY</h3>
                                    <button
                                        type="button"
                                        className="text-primary-blue text-sm m-0 underline cursor-pointer bg-transparent border-none p-0"
                                        onClick={(e) => { e.stopPropagation(); navigate('/mock-exams'); }}
                                    >
                                        Deepen your technical skills and manage industry solutions
                                    </button>
                                </div>
                                <img
                                    src="https://www.getmicrosoftcertification.com/lib/images/associate.png"
                                    alt="Microsoft Certified Associate"
                                    className="w-[60px] h-[60px] object-contain shrink-0 drop-shadow-sm md:self-center"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {mockExams.filter(exam => exam.category === 'Speciality').map((exam) => (
                                    <div key={exam.id} className="flex items-baseline gap-1 leading-relaxed">
                                        <span className="font-bold text-text-primary text-base whitespace-nowrap">{exam.code}</span>
                                        <span className="text-text-secondary font-normal">:</span>
                                        <span className="text-text-secondary text-base">{exam.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        </Link>
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/mock-exams" className="inline-block">
                            <Button variant="outline" size="large" icon={<FaArrowRight />}>
                                View All Exams
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Browse Categories */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Browse For Microsoft Certification</h2>
                        <p className="text-lg text-text-secondary max-w-[700px] mx-auto">
                            Explore certification categories across Azure, Dynamics, security, and modern work.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Infrastructure */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary-blue">INFRASTRUCTURE</h3>
                                <FaServer className="text-primary-blue text-3xl" aria-hidden="true" />
                            </div>
                            <p className="text-text-secondary">
                                Certifications for infrastructure technologies like Azure, Windows Server, and DevOps.
                            </p>
                        </div>

                        {/* Data and AI */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary-blue">DATA AND AI</h3>
                                <FaDatabase className="text-primary-blue text-3xl" aria-hidden="true" />
                            </div>
                            <p className="text-text-secondary">
                                Certifications covering data engineering, data science, and artificial intelligence.
                            </p>
                        </div>

                        {/* Digital Innovation */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary-blue">DIGITAL INNOVATION</h3>
                                <FaLightbulb className="text-primary-blue text-3xl" aria-hidden="true" />
                            </div>
                            <p className="text-text-secondary">
                                Certifications for app development and innovative technologies.
                            </p>
                        </div>

                        {/* Modern Work */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary-blue">MODERN WORK</h3>
                                <FaUsers className="text-primary-blue text-3xl" aria-hidden="true" />
                            </div>
                            <p className="text-text-secondary">
                                Certifications focused on modern workplace technologies and collaboration tools.
                            </p>
                        </div>

                        {/* Business Applications */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary-blue">BUSINESS APPLICATIONS</h3>
                                <FaThLarge className="text-primary-blue text-3xl" aria-hidden="true" />
                            </div>
                            <p className="text-text-secondary">
                                Certifications related to Dynamics 365 and business applications.
                            </p>
                        </div>

                        {/* Security */}
                        <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary-blue">SECURITY</h3>
                                <FaShieldAlt className="text-primary-blue text-3xl" aria-hidden="true" />
                            </div>
                            <p className="text-text-secondary">
                                Certifications related to cybersecurity, identity, and compliance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Browse by Difficulty Level */}
            <section className="py-16 bg-bg-light">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Browse Exams by Difficulty Level</h2>
                        <p className="text-lg text-text-secondary max-w-[700px] mx-auto">
                            Choose your learning path based on your experience level
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Beginner */}
                        <Link to="/mock-exams?difficulty=Beginner" className="block">
                            <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg cursor-pointer h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-emerald-600">BEGINNER</h3>
                                    <span className="text-4xl">🌱</span>
                                </div>
                                <p className="text-text-secondary mb-4">
                                    Perfect for those starting their cloud certification journey. Foundational exams covering core concepts.
                                </p>
                                <div className="mt-auto">
                                    <Button variant="outline" size="small">View Beginner Exams</Button>
                                </div>
                            </div>
                        </Link>

                        {/* Intermediate */}
                        <Link to="/mock-exams?difficulty=Intermediate" className="block">
                            <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg cursor-pointer h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-amber-600">INTERMEDIATE</h3>
                                    <span className="text-4xl">📈</span>
                                </div>
                                <p className="text-text-secondary mb-4">
                                    Build on your foundational knowledge with associate-level certifications for technical roles.
                                </p>
                                <div className="mt-auto">
                                    <Button variant="outline" size="small">View Intermediate Exams</Button>
                                </div>
                            </div>
                        </Link>

                        {/* Advanced */}
                        <Link to="/mock-exams?difficulty=Advanced" className="block">
                            <div className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg cursor-pointer h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-bold text-red-600">ADVANCED</h3>
                                    <span className="text-4xl">🏆</span>
                                </div>
                                <p className="text-text-secondary mb-4">
                                    Expert-level certifications for experienced professionals. Design and architect complex solutions.
                                </p>
                                <div className="mt-auto">
                                    <Button variant="outline" size="small">View Advanced Exams</Button>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Learning Paths */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Determine which certification is right for you and start learning</h2>
                        <p className="text-lg text-text-secondary max-w-[800px] mx-auto">Curated learning paths to help you get certified faster.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredExams.map((exam) => (
                            <div key={exam.id} className="bg-white border border-border rounded-xl p-6 shadow-md transition-shadow hover:shadow-lg flex flex-col gap-4">
                                <div className="flex items-start gap-3">
                                    <img
                                        src={badgeByCategory[exam.category] || badgeByCategory['Fundamentals']}
                                        alt={`${exam.category} badge`}
                                        className="w-12 h-12 rounded-full object-contain shrink-0"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-primary-blue mb-2">
                                            {exam.code}: {exam.title}
                                        </h3>
                                        <p className="text-text-secondary text-sm leading-relaxed">
                                            Practice questions and structured prep to master {exam.title}.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <Link to={`/mock-exams?code=${exam.code}`} className="inline-block">
                                        <Button variant="outline" size="small">Get Certified</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            Join thousands of successful cloud professionals
                        </p>
                    </div>

                    <TestimonialCarousel testimonials={testimonials} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-[800px] mx-auto">
                        <h2 className="text-4xl font-bold mb-4 text-white">Ready to Start Your Certification Journey?</h2>
                        <p className="text-lg mb-12 text-white/95">
                            Join our community of successful cloud professionals and achieve your career goals
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 justify-center flex-wrap">
                            <a href="https://www.bestitcourses.com/" target="_blank" rel="noopener noreferrer">
                                <Button variant="primary" size="large">
                                    Get Started Free
                                </Button>
                            </a>
                            <Link to="/contact">
                                <Button variant="secondary" size="large">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

function parseValueToNumber(value: string): { target: number; suffix: string } {
    const match = value.match(/([0-9,]+)([^0-9,]*)/);
    if (!match) return { target: 0, suffix: '' };
    const numeric = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = match[2] || '';
    return { target: isNaN(numeric) ? 0 : numeric, suffix };
}

function formatNumberWithCommas(n: number): string {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const AnimatedStat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const { target, suffix } = parseValueToNumber(value);
    const [display, setDisplay] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        const duration = 1200;
                        const start = performance.now();
                        const startVal = 0;
                        const animate = (now: number) => {
                            const progress = Math.min((now - start) / duration, 1);
                            const eased = 1 - Math.pow(1 - progress, 3);
                            const current = Math.floor(startVal + (target - startVal) * eased);
                            setDisplay(current);
                            if (progress < 1) requestAnimationFrame(animate);
                        };
                        requestAnimationFrame(animate);
                    }
                });
            },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, hasAnimated]);

    return (
        <div ref={ref} className="text-center p-8 bg-white rounded-lg shadow-lg animate-scaleIn">
            <h3 className="text-4xl font-extrabold text-primary-blue mb-2">
                {formatNumberWithCommas(display)}{suffix}
            </h3>
            <p className="text-base text-text-secondary m-0">{label}</p>
        </div>
    );
};

const TestimonialCarousel: React.FC<{ testimonials: Testimonial[] }> = ({ testimonials }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationId: number;
        const scrollSpeed = 0.5; // pixels per frame

        const autoScroll = () => {
            if (!isPaused && scrollContainer) {
                scrollContainer.scrollLeft += scrollSpeed;
                
                // Reset to beginning when reaching the end
                if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                    scrollContainer.scrollLeft = 0;
                }
            }
            animationId = requestAnimationFrame(autoScroll);
        };

        animationId = requestAnimationFrame(autoScroll);

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isPaused]);

    // Duplicate testimonials for infinite scroll effect
    const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials];

    return (
        <div 
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
            >
                {duplicatedTestimonials.map((testimonial, index) => (
                    <div key={`${testimonial.id}-${index}`} className="flex-shrink-0 w-[320px] md:w-[380px]">
                        <Card>
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <FaStar key={i} className="text-warning" />
                                ))}
                            </div>
                            <p className="italic text-text-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div>
                                    <h4 className="text-base font-semibold mb-1">{testimonial.name}</h4>
                                    <p className="text-sm text-text-light m-0">{testimonial.role}</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
            
            {/* Fade gradients on edges */}
            <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>
    );
};

export default Home;
