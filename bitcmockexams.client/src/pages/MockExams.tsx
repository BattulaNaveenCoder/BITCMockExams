import { useSearchParams } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import { mockExams } from '../data/mockData';

const MockExams = () => {
    const [searchParams] = useSearchParams();
    const difficulty = searchParams.get('difficulty');

    // Filter exams based on difficulty parameter
    const filteredExams = difficulty
        ? mockExams.filter(exam => exam.difficulty.toLowerCase() === difficulty.toLowerCase())
        : mockExams;

    const getDifficultyBadge = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner':
                return 'BEGINNER';
            case 'Intermediate':
                return 'INTERMEDIATE';
            case 'Advanced':
                return 'ADVANCED';
            default:
                return difficulty.toUpperCase();
        }
    };

    const getDifficultyColorClass = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                return 'bg-green-100 text-green-700';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-700';
            case 'advanced':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

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
                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-8">
                        {filteredExams.map((exam) => (
                            <div key={exam.id} className="bg-white border border-border rounded-lg p-8 transition-all duration-250 flex flex-col hover:shadow-lg hover:-translate-y-1">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-primary-blue font-semibold text-sm">{exam.vendor}</span>
                                    <span className={`px-3 py-1 rounded text-xs font-semibold uppercase ${getDifficultyColorClass(exam.difficulty)}`}>
                                        {getDifficultyBadge(exam.difficulty)}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-text-primary m-0 mb-2 leading-tight">{exam.title}</h3>
                                <p className="text-sm text-text-light m-0 mb-6">{exam.code}</p>

                                <div className="bg-bg-light rounded-md p-4 mb-6">
                                    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <span className="text-text-secondary text-sm">Questions:</span>
                                        <span className="text-text-primary font-semibold text-sm">{exam.questions}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <span className="text-text-secondary text-sm">Duration:</span>
                                        <span className="text-text-primary font-semibold text-sm">{exam.duration} min</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                        <span className="text-text-secondary text-sm">Students:</span>
                                        <span className="text-text-primary font-semibold text-sm">{exam.students.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-1 font-semibold text-text-primary">
                                        <FaStar className="text-warning text-base" />
                                        <span>{exam.rating}</span>
                                    </div>
                                    <div className="text-2xl font-bold text-primary-blue">${exam.price}</div>
                                </div>

                                <Button variant="primary" fullWidth>Start Practice</Button>
                            </div>
                        ))}
                    </div>
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
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Real Exam Questions</h3>
                            <p className="text-text-secondary m-0">Practice with questions taken from actual certification exams</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="text-5xl mb-4">💡</div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Detailed Explanations</h3>
                            <p className="text-text-secondary m-0">Understand every answer with comprehensive explanations</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="text-5xl mb-4">📈</div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Performance Analytics</h3>
                            <p className="text-text-secondary m-0">Track your progress and identify areas for improvement</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="text-5xl mb-4">🔄</div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Unlimited Attempts</h3>
                            <p className="text-text-secondary m-0">Practice as many times as you need to build confidence</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="text-5xl mb-4">⏱️</div>
                            <h3 className="text-xl mb-2 text-text-primary font-bold">Timed Mode</h3>
                            <p className="text-text-secondary m-0">Simulate real exam conditions with time limits</p>
                        </div>
                        <div className="text-center p-8 bg-white rounded-lg transition-all duration-250 hover:-translate-y-1 hover:shadow-lg">
                            <div className="text-5xl mb-4">✅</div>
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
