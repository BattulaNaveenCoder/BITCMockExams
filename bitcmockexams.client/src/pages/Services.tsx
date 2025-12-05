
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Card from '@shared/components/ui/Card';
import { services } from '../data/mockData';

const Services = () => {
    return (
        <div className="services-page">
            {/* Page Header */}
            <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4 text-white">Our Services</h1>
                    <p className="text-xl text-white/90 max-w-[600px] mx-auto">
                        Comprehensive solutions to accelerate your cloud certification journey
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
                        {services.map((service) => (
                            <Card key={service.id} hover>
                                <div className="text-6xl mb-6">{service.icon}</div>
                                <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                                <p className="text-text-secondary mb-4">{service.description}</p>

                                <h4 className="text-base font-semibold mt-6 mb-4">Key Features:</h4>
                                <ul className="list-none p-0 m-0 mb-8">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 mb-2 text-text-secondary text-sm">
                                            <FaCheckCircle className="text-success mt-1 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <Button variant="primary" fullWidth>
                                    Learn More <FaArrowRight />
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-16 bg-bg-light">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">How We Work</h2>
                        <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
                            Our proven process to ensure your certification success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-12 mt-12">
                        <div className="text-center p-8 bg-white rounded-lg shadow-md relative">
                            <div className="w-[60px] h-[60px] bg-gradient-to-br from-primary-blue to-secondary-blue text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">1</div>
                            <h3 className="mb-2 text-xl font-bold">Assessment</h3>
                            <p className="text-text-secondary m-0">We evaluate your current knowledge and identify your goals</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg shadow-md relative">
                            <div className="w-[60px] h-[60px] bg-gradient-to-br from-primary-blue to-secondary-blue text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">2</div>
                            <h3 className="mb-2 text-xl font-bold">Customized Plan</h3>
                            <p className="text-text-secondary m-0">Create a personalized study plan tailored to your needs</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg shadow-md relative">
                            <div className="w-[60px] h-[60px] bg-gradient-to-br from-primary-blue to-secondary-blue text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">3</div>
                            <h3 className="mb-2 text-xl font-bold">Training & Practice</h3>
                            <p className="text-text-secondary m-0">Engage in live training sessions and practice with mock exams</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg shadow-md relative">
                            <div className="w-[60px] h-[60px] bg-gradient-to-br from-primary-blue to-secondary-blue text-white rounded-full flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">4</div>
                            <h3 className="mb-2 text-xl font-bold">Certification Success</h3>
                            <p className="text-text-secondary m-0">Pass your exam with confidence and advance your career</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-[700px] mx-auto py-16">
                        <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
                        <p className="text-lg text-text-secondary mb-12">
                            Contact us today to discuss how we can help you achieve your certification goals
                        </p>
                        <div className="flex flex-col md:flex-row justify-center gap-4">
                            <Link to="/contact">
                                <Button variant="primary" size="large">
                                    Contact Us
                                </Button>
                            </Link>
                            <Link to="/mock-exams">
                                <Button variant="outline" size="large">
                                    Browse Mock Exams
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;
