
import { FaLinkedinIn } from 'react-icons/fa';
import Card from '@shared/components/ui/Card';
import { teamMembers, companyValues } from '../data/mockData';

const About = () => {
    return (
        <div className="about">
            {/* Page Header */}
            <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4 text-white">About Us</h1>
                    <p className="text-xl text-white/95 max-w-[600px] mx-auto">
                        Empowering professionals to achieve cloud certification success
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="mission-text">
                            <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
                            <p className="mb-6 leading-relaxed">
                                At AzureA2Z, we are dedicated to transforming the way professionals approach
                                cloud certifications. Our mission is to provide world-class training, comprehensive
                                practice exams, and personalized guidance that empowers individuals and organizations
                                to succeed in their cloud journey.
                            </p>
                            <p className="mb-6 leading-relaxed">
                                Founded by cloud experts with decades of combined experience, we understand the
                                challenges of certification preparation. That's why we've created a platform that
                                combines expert instruction, real-world scenarios, and proven study methodologies
                                to ensure your success.
                            </p>
                        </div>
                        <div className="md:order-first">
                            <img
                                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                                alt="Team collaboration"
                                className="w-full rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-bg-light">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
                        {companyValues.map((value) => (
                            <Card key={value.id}>
                                <div className="text-5xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                                <p className="text-text-secondary">{value.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            Experienced professionals dedicated to your success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
                        {teamMembers.map((member) => (
                            <Card key={member.id} hover>
                                <div className="w-full h-[250px] overflow-hidden rounded-md mb-4">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                <p className="text-primary-blue font-semibold mb-4">{member.title}</p>
                                <p className="text-sm text-text-secondary mb-4 leading-relaxed">{member.bio}</p>
                                <a
                                    href={member.linkedin}
                                    className="inline-flex items-center gap-2 text-primary-blue font-semibold text-sm mt-auto hover:text-secondary-blue"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaLinkedinIn /> Connect on LinkedIn
                                </a>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 bg-bg-light">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            Milestones in our mission to empower cloud professionals
                        </p>
                    </div>

                    <div className="max-w-[800px] mx-auto relative before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-primary-blue before:-translate-x-1/2 md:before:left-0 md:before:translate-x-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative md:gap-4 md:pl-8">
                            <div className="text-3xl font-extrabold text-primary-blue text-right pr-8 md:text-left md:pr-0">2018</div>
                            <div className="pr-8 md:pr-0">
                                <h4 className="text-xl font-bold mb-2">Company Founded</h4>
                                <p className="text-text-secondary m-0">Started with a vision to make cloud certification accessible to everyone</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative md:gap-4 md:pl-8">
                            <div className="order-2 text-left pl-8 md:order-1 md:pl-0 text-3xl font-extrabold text-primary-blue">2019</div>
                            <div className="order-1 text-right pr-8 md:order-2 md:text-left md:pr-0">
                                <h4 className="text-xl font-bold mb-2">10,000 Students</h4>
                                <p className="text-text-secondary m-0">Reached our first major milestone of 10,000 successful students</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative md:gap-4 md:pl-8">
                            <div className="text-3xl font-extrabold text-primary-blue text-right pr-8 md:text-left md:pr-0">2021</div>
                            <div className="pr-8 md:pr-0">
                                <h4 className="text-xl font-bold mb-2">Global Expansion</h4>
                                <p className="text-text-secondary m-0">Expanded services to 50+ countries worldwide</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative md:gap-4 md:pl-8">
                            <div className="order-2 text-left pl-8 md:order-1 md:pl-0 text-3xl font-extrabold text-primary-blue">2024</div>
                            <div className="order-1 text-right pr-8 md:order-2 md:text-left md:pr-0">
                                <h4 className="text-xl font-bold mb-2">50,000+ Students</h4>
                                <p className="text-text-secondary m-0">Celebrating 50,000+ certified professionals and counting</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
