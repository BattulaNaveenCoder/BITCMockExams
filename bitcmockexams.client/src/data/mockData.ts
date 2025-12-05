import type { Service, MockExam, BlogPost, TeamMember, Testimonial, Stat, CompanyValue } from '../types';

export const services: Service[] = [
    {
        id: 1,
        title: 'Cloud Certification Training',
        description: 'Expert-led live training for AWS, Azure, and Google Cloud certifications.',
        icon: '☁️',
        features: ['Live Online Classes', 'Hands-on Labs', 'Expert Instructors', 'Flexible Schedule']
    },
    {
        id: 2,
        title: 'Mock Exams & Practice Tests',
        description: 'Comprehensive practice exams that simulate real certification tests.',
        icon: '📝',
        features: ['Real Exam Questions', 'Detailed Explanations', 'Performance Analytics', 'Unlimited Attempts']
    },
    {
        id: 3,
        title: 'Certification Guidance',
        description: 'Personalized roadmap and mentorship for your certification journey.',
        icon: '🎯',
        features: ['Career Counseling', 'Study Plans', 'Resource Recommendations', 'One-on-One Support']
    },
    {
        id: 4,
        title: 'Interview Preparation',
        description: 'Technical interview prep with real-world scenarios and questions.',
        icon: '💼',
        features: ['Mock Interviews', 'Technical Questions', 'Behavioral Prep', 'Resume Review']
    },
    {
        id: 5,
        title: 'Corporate Training',
        description: 'Customized training programs for teams and organizations.',
        icon: '🏢',
        features: ['Custom Curriculum', 'On-site/Remote', 'Team Assessments', 'Progress Tracking']
    },
    {
        id: 6,
        title: 'Technology Consulting',
        description: 'Strategic consulting for cloud migration and digital transformation.',
        icon: '🚀',
        features: ['Architecture Design', 'Migration Planning', 'Best Practices', 'Cost Optimization']
    }
];

export const mockExams: MockExam[] = [
    // Fundamentals
    {
        id: 1,
        title: 'Azure Fundamentals',
        code: 'AZ-900',
        vendor: 'Microsoft',
        category: 'Fundamentals',
        description: 'Master the basics',
        questions: 40,
        duration: 60,
        difficulty: 'Beginner',
        price: 19.99,
        rating: 4.8,
        students: 25000,
        image: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 2,
        title: 'Azure AI Fundamentals',
        code: 'AI-900',
        vendor: 'Microsoft',
        category: 'Fundamentals',
        description: 'Master the basics',
        questions: 40,
        duration: 60,
        difficulty: 'Beginner',
        price: 19.99,
        rating: 4.7,
        students: 18000,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 3,
        title: 'Azure Data Fundamentals',
        code: 'DP-900',
        vendor: 'Microsoft',
        category: 'Fundamentals',
        description: 'Master the basics',
        questions: 40,
        duration: 60,
        difficulty: 'Beginner',
        price: 19.99,
        rating: 4.8,
        students: 20000,
        image: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 4,
        title: 'Microsoft 365 Fundamentals',
        code: 'MS-900',
        vendor: 'Microsoft',
        category: 'Fundamentals',
        description: 'Master the basics',
        questions: 40,
        duration: 60,
        difficulty: 'Beginner',
        price: 19.99,
        rating: 4.6,
        students: 15000,
        image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop'
    },
    // Role-Based
    {
        id: 5,
        title: 'Azure Administrator',
        code: 'AZ-104',
        vendor: 'Microsoft',
        category: 'Role-Based',
        description: 'Expand your technical skill set',
        questions: 60,
        duration: 120,
        difficulty: 'Intermediate',
        price: 29.99,
        rating: 4.9,
        students: 22000,
        image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 6,
        title: 'Azure Developer',
        code: 'AZ-204',
        vendor: 'Microsoft',
        category: 'Role-Based',
        description: 'Expand your technical skill set',
        questions: 60,
        duration: 120,
        difficulty: 'Intermediate',
        price: 29.99,
        rating: 4.8,
        students: 18500,
        image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 7,
        title: 'Azure Solution Architect Expert',
        code: 'AZ-305',
        vendor: 'Microsoft',
        category: 'Role-Based',
        description: 'Expand your technical skill set',
        questions: 60,
        duration: 120,
        difficulty: 'Advanced',
        price: 34.99,
        rating: 4.9,
        students: 16000,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 8,
        title: 'Microsoft DevOps Engineer',
        code: 'AZ-400',
        vendor: 'Microsoft',
        category: 'Role-Based',
        description: 'Expand your technical skill set',
        questions: 60,
        duration: 120,
        difficulty: 'Advanced',
        price: 34.99,
        rating: 4.8,
        students: 14500,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop'
    },
    // Speciality
    {
        id: 9,
        title: 'Azure for SAP Workloads',
        code: 'AZ-120',
        vendor: 'Microsoft',
        category: 'Speciality',
        description: 'Deepen your technical skills and manage industry solutions',
        questions: 50,
        duration: 120,
        difficulty: 'Advanced',
        price: 39.99,
        rating: 4.7,
        students: 8000,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 10,
        title: 'Azure Virtual Desktop',
        code: 'AZ-140',
        vendor: 'Microsoft',
        category: 'Speciality',
        description: 'Deepen your technical skills and manage industry solutions',
        questions: 50,
        duration: 120,
        difficulty: 'Advanced',
        price: 39.99,
        rating: 4.8,
        students: 9500,
        image: 'https://images.unsplash.com/photo-1589149098258-3e9102cd63d3?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 11,
        title: 'Azure Cosmos DB',
        code: 'DP-420',
        vendor: 'Microsoft',
        category: 'Speciality',
        description: 'Deepen your technical skills and manage industry solutions',
        questions: 50,
        duration: 120,
        difficulty: 'Advanced',
        price: 39.99,
        rating: 4.9,
        students: 7500,
        image: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop'
    }
];

export const blogPosts: BlogPost[] = [
    {
        id: 1,
        title: 'Top 10 Tips for Passing AWS Solutions Architect Exam',
        excerpt: 'Discover proven strategies and study techniques to ace your AWS certification on the first attempt.',
        category: 'Certification Tips',
        author: 'John Smith',
        date: '2024-11-20',
        readTime: '5 min read',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'
    },
    {
        id: 2,
        title: 'Azure vs AWS: Which Cloud Platform Should You Choose?',
        excerpt: 'A comprehensive comparison of the two leading cloud platforms to help you make an informed decision.',
        category: 'Cloud Computing',
        author: 'Sarah Johnson',
        date: '2024-11-18',
        readTime: '8 min read',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'
    },
    {
        id: 3,
        title: 'The Ultimate Guide to Kubernetes Certification',
        excerpt: 'Everything you need to know about CKA and CKAD certifications, from preparation to exam day.',
        category: 'DevOps',
        author: 'Michael Chen',
        date: '2024-11-15',
        readTime: '10 min read',
        image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80'
    },
    {
        id: 4,
        title: 'Cloud Security Best Practices for 2024',
        excerpt: 'Essential security practices every cloud professional should implement to protect their infrastructure.',
        category: 'Security',
        author: 'Emily Davis',
        date: '2024-11-12',
        readTime: '7 min read',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80'
    },
    {
        id: 5,
        title: 'How to Build a Successful Career in Cloud Computing',
        excerpt: 'Career roadmap and advice for aspiring cloud professionals looking to break into the industry.',
        category: 'Career',
        author: 'David Wilson',
        date: '2024-11-10',
        readTime: '6 min read',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80'
    },
    {
        id: 6,
        title: 'Understanding Serverless Architecture',
        excerpt: 'A deep dive into serverless computing, its benefits, and when to use it in your projects.',
        category: 'Architecture',
        author: 'Lisa Anderson',
        date: '2024-11-08',
        readTime: '9 min read',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
    }
];

export const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: 'Mr. Sandeep Soni',
        title: 'Founder & CEO',
        bio: '29+ years of experience',
        image: 'https://www.deccansoft.com/assets/img/team/Sandeep%20Soni%20Dss%20Home%20page.jpg',
        experience: 'Trained 300000+ students',
        linkedin: 'https://www.linkedin.com/in/sandeepsoni123/'
    },
    {
        id: 2,
        name: 'Mr. Rahul Rampurkar',
        title: 'CTO',
        bio: '29+ years of experience',
        experience: 'Trained 250000+ students',
        image: 'https://www.deccansoft.com/assets/img/team/Our-Team/Rahul%20sir%20DSS.png',
        linkedin: 'https://www.linkedin.com/in/rahulrampurkar/'
    },
    {
        id: 3,
        name: 'Mrs. Vandana Soni',
        title: 'Director',
        bio: '25+ years of experience',
        experience: 'Trained 200000+ students',
        image: 'https://www.deccansoft.com/assets/img/team/VandanaMadam450.jpg',
        linkedin: 'https://www.linkedin.com/in/vandana-soni-85a29475/'
    },
];

export const testimonials: Testimonial[] = [
    {
        id: 1,
        name: 'Robert Martinez',
        role: 'Cloud Engineer at Tech Corp',
        content: 'The mock exams were incredibly helpful! They closely mirrored the actual AWS exam and helped me pass on my first attempt.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    {
        id: 2,
        name: 'Jennifer Lee',
        role: 'DevOps Engineer',
        content: 'Excellent training program with knowledgeable instructors. The hands-on labs were particularly valuable.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'
    },
    {
        id: 3,
        name: 'David Thompson',
        role: 'Solutions Architect',
        content: 'Best investment I made in my career. Passed three certifications with their guidance and practice tests.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'
    }
];

export const stats: Stat[] = [
    { label: 'Years Training Experience', value: '28+' },
    { label: 'Student Careers', value: '500,000+' },
    { label: 'Online Training Batches', value: '10,000+' },
    { label: 'Corporate Trainings', value: '500+' },
    { label: 'Highly Qualified Faculty', value: '10+' }
];

export const companyValues: CompanyValue[] = [
    {
        id: 1,
        title: 'Excellence',
        description: 'We strive for excellence in everything we do, from course content to student support.',
        icon: '⭐'
    },
    {
        id: 2,
        title: 'Innovation',
        description: 'Continuously updating our content and methods to reflect the latest industry trends.',
        icon: '💡'
    },
    {
        id: 3,
        title: 'Integrity',
        description: 'We maintain the highest standards of honesty and ethical practices in all our operations.',
        icon: '🤝'
    },
    {
        id: 4,
        title: 'Student Success',
        description: 'Your success is our success. We are committed to helping you achieve your career goals.',
        icon: '🎓'
    }
];
