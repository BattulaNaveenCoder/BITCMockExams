export interface Service {
    id: number;
    title: string;
    description: string;
    icon: string;
    features: string[];
}

export interface MockExam {
    id: number;
    title: string;
    code: string;
    suiteId?: string;
    pathId?: string;
    vendor: string;
    category: string;
    description: string;
    questions: number;
    duration: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    price: number;
    rating: number;
    students: number;
    image?: string;
}

export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    image: string;
}

export interface TeamMember {
    id: number;
    name: string;
    title: string;
    bio: string;
    image: string;
    experience?: string;
    linkedin: string;
}

export interface Testimonial {
    id: number;
    name: string;
    role: string;
    content: string;
    rating: number;
    // image: string;
}

export interface Stat {
    label: string;
    value: string;
}

export interface CompanyValue {
    id: number;
    title: string;
    description: string;
    icon: string;
}

// Auth types
export interface LoginRequest {
    emailid: string;
    password: string;
}

export interface LoginResponse {
    // Flexible to accommodate unknown backend shape
    token?: string;
    accessToken?: string;
    message?: string;
    success?: boolean;
    data?: any;
    [key: string]: any;
}
