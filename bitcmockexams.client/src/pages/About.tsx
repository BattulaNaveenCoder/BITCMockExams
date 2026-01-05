
// import { FaLinkedinIn, FaTrophy, FaLightbulb, FaShieldAlt, FaUserGraduate } from 'react-icons/fa';
// import Card from '@shared/components/ui/Card';
// import { teamMembers, companyValues } from '../data/mockData';

// const About = () => {
//     return (
//         <div className="about">
//             {/* Page Header */}
//             <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
//                 <div className="container mx-auto px-4">
//                     <h1 className="text-4xl font-bold mb-4 text-white">About Us</h1>
//                     <p className="text-xl text-white/95 max-w-[600px] mx-auto">
//                         Empowering professionals to achieve cloud certification success
//                     </p>
//                 </div>
//             </section>

//             {/* Mission Section */}
//             <section className="py-16 bg-white">
//                 <div className="container mx-auto px-4">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
//                         <div className="mission-text">
//                             <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
//                             <p className="mb-6 leading-relaxed">
//                                 At exam.getmicrosoftcertification, our mission is to bridge the gap between ambition and achievement. We provide high-fidelity mock exams designed to mirror the rigors of official Microsoft assessments, ensuring that IT professionals worldwide have the confidence, knowledge, and practice needed to earn their credentials and accelerate their careers.
//                             </p>
//                             <p className="mb-6 leading-relaxed">
//                                 Founded by cloud experts with decades of combined experience, we understand the
//                                 challenges of certification preparation. That's why we've created a platform that
//                                 combines expert instruction, real-world scenarios, and proven study methodologies
//                                 to ensure your success.
//                             </p>
//                         </div>
//                         <div className="md:order-first">
//                             <img
//                                 src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
//                                 alt="Team collaboration"
//                                 className="w-full rounded-lg shadow-xl"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* Values Section */}
//             <section className="py-16 bg-bg-light">
//                 <div className="container mx-auto px-4">
//                     <div className="mb-12 text-center">
//                         <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
//                         <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
//                             The principles that guide everything we do
//                         </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
//                         {companyValues.map((value) => {
//                             const IconComponent = 
//                                 value.title === 'Excellence' ? FaTrophy :
//                                 value.title === 'Innovation' ? FaLightbulb :
//                                 value.title === 'Integrity' ? FaShieldAlt :
//                                 value.title === 'Student Success' ? FaUserGraduate :
//                                 FaTrophy;
                            
//                             return (
//                                 <Card key={value.id}>
//                                     <div className="text-5xl mb-4 text-primary-blue">
//                                         <IconComponent />
//                                     </div>
//                                     <h3 className="text-xl font-bold mb-2">{value.title}</h3>
//                                     <p className="text-text-secondary">{value.description}</p>
//                                 </Card>
//                             );
//                         })}
//                     </div>
//                 </div>
//             </section>

//             {/* Team Section */}
//             <section className="py-16 bg-white">
//                 <div className="container mx-auto px-4">
//                     <div className="mb-12 text-center">
//                         <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
//                         <p className="text-lg text-text-secondary max-w-[600px] mx-auto">
//                             Experienced professionals dedicated to your success
//                         </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8">
//                         {teamMembers.map((member) => (
//                             <Card key={member.id} hover>
//                                 <div className="w-full h-[250px] overflow-hidden rounded-md mb-4">
//                                     <img
//                                         src={member.image}
//                                         alt={member.name}
//                                         className="w-full h-full object-contain"
//                                     />
//                                 </div>
//                                 <h3 className="text-xl font-bold mb-1 text-center">{member.name}</h3>
//                                 <p className="text-primary-blue font-semibold mb-2 text-center">{member.title}</p>
//                                 {member.bio && (
//                                     <p className="text-sm font-semibold text-text-secondary leading-relaxed text-center">{member.bio}</p>
//                                 )}
//                                 {(member as any)?.experience && (
//                                     <p className="text-sm font-semibold text-text-secondary leading-relaxed text-center">{(member as any).experience}</p>
//                                 )}
//                                 {/* <a
//                                     href={member.linkedin}
//                                     className="inline-flex items-center gap-2 text-primary-blue font-semibold text-sm mt-auto hover:text-secondary-blue"
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                 >
//                                     <FaLinkedinIn />
//                                 </a> */}
//                             </Card>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* Timeline Section - History, Mission, Vision, Why Choose Us */}
//             <section className="py-16 bg-gray-50">
//                 <div className="container mx-auto px-4">
//                     <div className="max-w-5xl mx-auto relative">
//                         {/* Vertical Line */}
//                         <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary-blue transform -translate-x-1/2 hidden md:block"></div>

//                         {/* Timeline Items */}
//                         <div className="space-y-12">
//                             {/* Our History - Left Side (Teal) */}
//                             <div className="relative flex flex-col md:flex-row items-center gap-8">
//                                 <div className="w-full md:w-1/2 md:pr-12">
//                                     <div className="bg-gradient-to-br from-accent-blue to-primary-blue text-white p-8 rounded-lg shadow-lg">
//                                         <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Our History</h2>
//                                         <p className="leading-relaxed text-white/95">
//                                              was founded in 1997 by Sandeep Soni and Rahul Rampurkar.
//                                             Since its inception, it has earned strong recognition for innovation and commitment in software training, particularly in Microsoft Azure and other modern technologies.
//                                             The institute is considered one of India’s top training centers and has trained over 1,50,000 candidates who are now placed in companies worldwide.
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="hidden md:flex w-12 h-12 bg-primary-blue rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0"></div>
//                                 <div className="w-full md:w-1/2"></div>
//                             </div>

//                             {/* Our Mission - Right Side (Dark Blue) */}
//                             <div className="relative flex flex-col md:flex-row items-center gap-8">
//                                 <div className="w-full md:w-1/2"></div>
//                                 <div className="hidden md:flex w-12 h-12 bg-primary-blue rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0"></div>
//                                 <div className="w-full md:w-1/2 md:pl-12">
//                                     <div className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white p-8 rounded-lg shadow-lg">
//                                         <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Our Mission</h2>
//                                         <p className="leading-relaxed text-white/95">
//                                             To deliver exceptional services to our clients by upholding the Deccansoft Code of Ethics, honoring our Service Promises, and consistently aligning our actions with the expectations of all stakeholders.
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Our Vision - Left Side (Coral/Red) */}
//                             <div className="relative flex flex-col md:flex-row items-center gap-8">
//                                 <div className="w-full md:w-1/2 md:pr-12">
//                                     <div className="bg-gradient-to-br from-secondary-blue to-dark-blue text-white p-8 rounded-lg shadow-lg">
//                                         <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Our Vision</h2>
//                                         <p className="leading-relaxed text-white/95">
//                                             To be recognized as a trusted and valued partner in delivering quality through our expertise and innovative thinking, while developing business-critical solutions for clients across the globe.
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <div className="hidden md:flex w-12 h-12 bg-primary-blue rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0"></div>
//                                 <div className="w-full md:w-1/2"></div>
//                             </div>

//                             {/* Why Choose Us - Right Side (Light Blue) */}
//                             <div className="relative flex flex-col md:flex-row items-center gap-8">
//                                 <div className="w-full md:w-1/2"></div>
//                                 <div className="hidden md:flex w-12 h-12 bg-cyan-400 rounded-full border-4 border-white shadow-lg z-10 flex-shrink-0"></div>
//                                 <div className="w-full md:w-1/2 md:pl-12">
//                                     <div className="bg-gradient-to-br from-dark-blue to-[#003050] text-white p-8 rounded-lg shadow-lg">
//                                         <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Why Choose Us</h2>
//                                         <p className="leading-relaxed text-white/95">
//                                             To deliver exceptional and distinctive services to our clients by upholding the Deccansoft Code of Ethics, honoring our Service Promises, and consistently aligning our efforts with the interests of all stakeholders.
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//         </div>
//     );
// };

// export default About;
