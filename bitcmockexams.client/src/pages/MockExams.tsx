import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExamCard from '@shared/components/exams/ExamCard';
import { useTestSuitesApi, type TestSuite } from '@shared/api/testSuites';
import type { MockExam } from '../types';
import { useAuth } from '@features/auth/context/AuthContext';

const MockExams = () => {
    const [searchParams] = useSearchParams();
    const difficulty = searchParams.get('difficulty');

    const { getAllTestSuitesByUserId } = useTestSuitesApi();
    const [suites, setSuites] = useState<TestSuite[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useAuth();
    const userId = useMemo(() => (user as any)?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid'] as string || '', [user]);

    useEffect(() => {
        let mounted = true;
        const loadSuites = async () => {
            console.log('Loading test suites for user:', userId);
            setLoading(true);
            try {
                const data = await getAllTestSuitesByUserId(userId);
                console.log('Fetched test suites:', data);
                if (mounted) setSuites(data);
            } catch (e) {
                // errors already handled in service; keep UI resilient
            } finally {
                if (mounted) setLoading(false);
            }
        };
        if (userId) {
            loadSuites();
        } else {
            // If no userId, ensure we don't show infinite loading
            setLoading(false);
        }
        return () => {
            mounted = false;
        };
    }, [userId]);

    const mappedExams: MockExam[] = useMemo(() => {
        // Category definitions
        const beginners = new Set([
            'AZ-900', 'DP-900', 'AI-900', 'PL-900'
        ].map((c) => c.toUpperCase()));
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
            'Docker Certified Associate', 'SQL Server Live Session'
        ].map((c) => c.toUpperCase()));
        const advanced = new Set([
            'AZ-305', 'AZ-400', 'PL-600', 'AI-102'
        ].map((c) => c.toUpperCase()));

        const levelOrder: Record<string, number> = {
            Beginner: 0,
            Intermediate: 1,
            Advanced: 2,
        };

        const inferDifficulty = (code: string, title: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
            const key = code.trim().toUpperCase();
            const t = title.trim();
            // Direct code match
            if (beginners.has(key)) return 'Beginner';
            if (advanced.has(key)) return 'Advanced';
            if (intermediates.has(key)) return 'Intermediate';
            // Title-based special cases
            if (/Challenge/i.test(t) && /AZ-104/i.test(t)) return 'Intermediate';
            if (/Docker Certified Associate/i.test(t)) return 'Intermediate';
            if (/SQL Server Live Session/i.test(t)) return 'Intermediate';
            // Fallback by prefix
            if (key.startsWith('AZ-900') || key.startsWith('DP-900') || key.startsWith('AI-900') || key.startsWith('PL-900')) return 'Beginner';
            if (key.startsWith('AZ-305') || key.startsWith('AZ-400') || key.startsWith('PL-600') || key.startsWith('AI-102')) return 'Advanced';
            return 'Intermediate';
        };

        const exams = suites.map((s, idx) => {
            const code = (s.PathId || '').split(':')[0] || 'EXAM';
            const difficulty = inferDifficulty(code, s.TestSuiteTitle || '');
            return {
                id: idx + 1,
                title: s.TestSuiteTitle,
                code,
                suiteId: s.PKTestSuiteId,
                pathId: s.PathId,
                vendor: 'Microsoft',
                category: 'Certification',
                description: s.FKContributorName || 'Certification practice tests',
                questions: s.totalCountQues ?? 0,
                duration: 60,
                difficulty,
                price: 0,
                rating: s.Average ?? 0,
                students: s.TotalLearners ?? 0,
                image: s.ImageTestsuiteUrl,
            } as MockExam;
        });

        // Order by Beginner -> Intermediate -> Advanced
        exams.sort((a, b) => levelOrder[a.difficulty] - levelOrder[b.difficulty]);
        return exams;
    }, [suites]);

    // Filter exams based on difficulty parameter
    const filteredExams = useMemo(() => {
        if (!difficulty) return mappedExams;
        return mappedExams.filter(
            (exam) => exam.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
    }, [mappedExams, difficulty]);

    // Card presentation is handled by shared ExamCard component

    return (
        <div className="mock-exams">
            {/* Page Header */}
            <section className="bg-gradient-to-br from-primary-blue to-secondary-blue text-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4 text-white">Microsoft Certification Exams</h1>
                    <p className="text-xl text-white/90 max-w-[600px] mx-auto">
                        Practice with real exam scenarios and boost your confidence before the actual test
                    </p>
                </div>
            </section>

            {/* Exams Grid */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="text-center py-10 text-text-secondary">Loading test suites...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredExams.map((exam) => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-16 bg-bg-light">
                <div className="container mx-auto px-4">
                    <div className="mb-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">Why Choose Our Mock Exams?</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-primary-blue">
                                    <rect x="3" y="10" width="3" height="11" rx="1" strokeWidth="2" />
                                    <rect x="9" y="6" width="3" height="15" rx="1" strokeWidth="2" />
                                    <rect x="15" y="3" width="3" height="18" rx="1" strokeWidth="2" />
                                </svg>
                            </div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Real Exam Questions</h3>
                            <p className="text-text-secondary m-0">Practice with questions taken from actual certification exams</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-amber-500">
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 22h4M12 2a7 7 0 00-7 7c0 2.5 1.4 4.2 3 5.4.7.6 1 1.1 1 1.6V17h6v-1c0-.5.3-1 .9-1.5 1.7-1.2 3.1-3 3.1-5.5a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Detailed Explanations</h3>
                            <p className="text-text-secondary m-0">Understand every answer with comprehensive explanations</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-primary-blue">
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 6-8" />
                                    <path strokeWidth="2" d="M3 21h18" />
                                </svg>
                            </div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Performance Analytics</h3>
                            <p className="text-text-secondary m-0">Track your progress and identify areas for improvement</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-primary-blue">
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 7h4V3M20 17h-4v4M7 4a9 9 0 0113 8M17 20a9 9 0 01-13-8" />
                                </svg>
                            </div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Unlimited Attempts</h3>
                            <p className="text-text-secondary m-0">Practice as many times as you need to build confidence</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-violet-600">
                                    <circle cx="12" cy="13" r="8" strokeWidth="2" />
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 13l3 3M9 3h6" />
                                </svg>
                            </div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Timed Mode</h3>
                            <p className="text-text-secondary m-0">Simulate real exam conditions with time limits</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="mb-4 flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12 text-emerald-600">
                                    <rect x="4" y="4" width="16" height="16" rx="3" strokeWidth="2" />
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l3 3 5-6" />
                                </svg>
                            </div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Up-to-Date Content</h3>
                            <p className="text-text-secondary m-0">Regularly updated to match the latest exam patterns</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MockExams;
