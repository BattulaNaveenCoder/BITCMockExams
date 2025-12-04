import { Link } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { mockExams, testimonials, stats } from '../data/mockData';

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="relative min-h-[600px] display flex items-center bg-gradient-to-br from-primary-blue via-secondary-blue to-dark-blue text-white overflow-hidden md:min-h-[500px]">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/90 to-secondary-blue/80"></div>
                <div className="container mx-auto px-4 relative z-10 py-16">
                    <div className="max-w-[800px] animate-fadeIn">
                        <h1 className="text-5xl font-extrabold mb-6 leading-tight text-white md:text-3xl">
                            Transform Your Cloud Journey
                        </h1>
                        <p className="text-xl mb-12 leading-relaxed text-white/95 md:text-base">
                            Master cloud certifications with expert-led training, comprehensive mock exams,
                            and personalized guidance. Join 50,000+ successful students worldwide.
                        </p>
                        <div className="flex flex-col md:flex-row gap-6 flex-wrap">
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
            <section className="bg-white py-12 -mt-12 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-8 bg-white rounded-lg shadow-lg animate-scaleIn">
                                <h3 className="text-4xl font-extrabold text-primary-blue mb-2">{stat.value}</h3>
                                <p className="text-base text-text-secondary m-0">{stat.label}</p>
                            </div>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-bg-light md:gap-4">
                                <div>
                                    <h3 className="text-2xl text-primary-blue m-0 mb-1 font-bold">FUNDAMENTALS</h3>
                                    <Link to="/mock-exams" className="text-primary-blue text-sm m-0 underline cursor-pointer">Master the basics</Link>
                                </div>
                                <svg width="60" height="60" viewBox="0 0 100 100" className="shrink-0 drop-shadow-sm md:self-center">
                                    <defs>
                                        <linearGradient id="gradient-fundamentals" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#0078D4', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#004578', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M50 10 L80 25 L80 50 Q80 75 50 90 Q20 75 20 50 L20 25 Z"
                                        fill="url(#gradient-fundamentals)"
                                        stroke="#fff"
                                        strokeWidth="2"
                                    />
                                    <g transform="translate(50, 35)">
                                        <rect x="-12" y="-8" width="5" height="5" fill="#fff" />
                                        <rect x="-6" y="-8" width="5" height="5" fill="#fff" />
                                        <rect x="-12" y="-2" width="5" height="5" fill="#fff" />
                                        <rect x="-6" y="-2" width="5" height="5" fill="#fff" />
                                    </g>
                                    <text x="50" y="65" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">MICROSOFT</text>
                                    <text x="50" y="75" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600">CERTIFIED</text>
                                    <text x="50" y="85" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="600">FUNDAMENTAL</text>
                                </svg>
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

                        <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-bg-light md:gap-4">
                                <div>
                                    <h3 className="text-2xl text-primary-blue m-0 mb-1 font-bold">ROLE-BASED</h3>
                                    <Link to="/mock-exams" className="text-primary-blue text-sm m-0 underline cursor-pointer">Expand your technical skill set</Link>
                                </div>
                                <svg width="60" height="60" viewBox="0 0 100 100" className="shrink-0 drop-shadow-sm md:self-center">
                                    <defs>
                                        <linearGradient id="gradient-rolebased" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#106EBE', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#004578', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M50 10 L80 25 L80 50 Q80 75 50 90 Q20 75 20 50 L20 25 Z"
                                        fill="url(#gradient-rolebased)"
                                        stroke="#fff"
                                        strokeWidth="2"
                                    />
                                    <g transform="translate(50, 35)">
                                        <rect x="-12" y="-8" width="5" height="5" fill="#fff" />
                                        <rect x="-6" y="-8" width="5" height="5" fill="#fff" />
                                        <rect x="-12" y="-2" width="5" height="5" fill="#fff" />
                                        <rect x="-6" y="-2" width="5" height="5" fill="#fff" />
                                    </g>
                                    <text x="50" y="65" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">MICROSOFT</text>
                                    <text x="50" y="75" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600">CERTIFIED</text>
                                    <text x="50" y="85" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="600">EXPERT</text>
                                </svg>
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

                        <div className="bg-white border border-border rounded-lg p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-6 border-b-2 border-bg-light md:gap-4">
                                <div>
                                    <h3 className="text-2xl text-primary-blue m-0 mb-1 font-bold">SPECIALITY</h3>
                                    <Link to="/mock-exams" className="text-primary-blue text-sm m-0 underline cursor-pointer">Deepen your technical skills and manage industry solutions</Link>
                                </div>
                                <svg width="60" height="60" viewBox="0 0 100 100" className="shrink-0 drop-shadow-sm md:self-center">
                                    <defs>
                                        <linearGradient id="gradient-speciality" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#50E6FF', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#004578', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M50 10 L80 25 L80 50 Q80 75 50 90 Q20 75 20 50 L20 25 Z"
                                        fill="url(#gradient-speciality)"
                                        stroke="#fff"
                                        strokeWidth="2"
                                    />
                                    <g transform="translate(50, 35)">
                                        <rect x="-12" y="-8" width="5" height="5" fill="#fff" />
                                        <rect x="-6" y="-8" width="5" height="5" fill="#fff" />
                                        <rect x="-12" y="-2" width="5" height="5" fill="#fff" />
                                        <rect x="-6" y="-2" width="5" height="5" fill="#fff" />
                                    </g>
                                    <text x="50" y="65" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">MICROSOFT</text>
                                    <text x="50" y="75" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="600">CERTIFIED</text>
                                    <text x="50" y="85" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="600">ASSOCIATE</text>
                                </svg>
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
                    </div>

                    <div className="text-center mt-12">
                        <Link to="/mock-exams">
                            <Button variant="outline" size="large">
                                View All Exams <FaArrowRight />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            Join thousands of successful cloud professionals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8">
                        {testimonials.map((testimonial) => (
                            <Card key={testimonial.id}>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FaStar key={i} className="text-warning" />
                                    ))}
                                </div>
                                <p className="italic text-text-secondary mb-6 leading-relaxed">"{testimonial.content}"</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-[50px] h-[50px] rounded-full object-cover"
                                    />
                                    <div>
                                        <h4 className="text-base font-semibold mb-1">{testimonial.name}</h4>
                                        <p className="text-sm text-text-light m-0">{testimonial.role}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
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

export default Home;
