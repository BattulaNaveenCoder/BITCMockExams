import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from '@shared/components/layout/Layout';
import { LoadingProvider } from '@shared/contexts/LoadingContext';
import Loader from '@shared/components/layout/Loader';
import { AuthProvider, useAuth } from '@features/auth/context/AuthContext';
import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import { LoginModalProvider } from '@features/auth/context/LoginModalContext';
import { TestSuitesProvider } from '@shared/contexts/TestSuitesContext';
import RecaptchaV3Badge from '@shared/components/ui/RecaptchaV3Badge';

// Eagerly load critical components for home page
import Home from '../pages/Home';

// Lazy load all other pages for code splitting
const MockExams = lazy(() => import('../pages/MockExams'));
const CertificationExams = lazy(() => import('../pages/CertificationExams'));
const ExamTopics = lazy(() => import('../pages/ExamTopics'));
const Contact = lazy(() => import('../pages/Contact'));
const SignUp = lazy(() => import('../pages/SignUp'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const PracticeExam = lazy(() => import('../pages/PracticeExam'));
const ExamReview = lazy(() => import('../components/exam/ExamReview'));
const PageNotFound = lazy(() => import('../pages/PageNotFound'));
const LoginModal = lazy(() => import('../components/auth/LoginModal'));
const SiteMap = lazy(() => import('../pages/SiteMap'));

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

function App() {
    return (
        <HelmetProvider>
            <LoadingProvider>
                <Router>
                    <LoginModalProvider>
                        <AuthProvider>
                            <TestSuitesProvider>
                                <Loader />
                                <RecaptchaV3Badge />
                                <ScrollToTop />
                                <Suspense fallback={<Loader />}>
                                    <LoginModal />
                                </Suspense>
                                <AuthRoutes />
                            </TestSuitesProvider>
                        </AuthProvider>
                    </LoginModalProvider>
                </Router>
            </LoadingProvider>
        </HelmetProvider>
    );
}

export default App;

function AuthRoutes() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    
    if (isAuthenticated && (location.pathname === '/signup')) {
        const searchParams = new URLSearchParams(location.search);
        const returnUrl = searchParams.get('returnURL');
        if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
            return <Navigate to={decodeURIComponent(returnUrl)} replace />;
        }
        return <Navigate to="/" replace />;
    }

    return (
        <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            {/* <Route path="/about" element={<Layout><About /></Layout>} /> */}
            <Route path="/certification-exams" element={
                <Suspense fallback={<Layout><Loader /></Layout>}>
                    <Layout><CertificationExams /></Layout>
                </Suspense>
            } />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Suspense fallback={<Layout><Loader /></Layout>}>
                            <Layout><Dashboard /></Layout>
                        </Suspense>
                    </ProtectedRoute>
                }
            />
            {/** Exam Reports now rendered as a tab inside Dashboard; route removed **/}
            <Route
                path="/mock-exams"
                element={
                    <Suspense fallback={<Layout><Loader /></Layout>}>
                        <Layout><MockExams /></Layout>
                    </Suspense>
                }
            />
            <Route
                path="/exams/:PathId"
                element={
                    <Suspense fallback={<Layout><Loader /></Layout>}>
                        <Layout><ExamTopics /></Layout>
                    </Suspense>
                }
            />
            <Route
                path="/sitemap"
                element={
                    <Suspense fallback={<Layout><Loader /></Layout>}>
                        <Layout><SiteMap /></Layout>
                    </Suspense>
                }
            />
            <Route
                path="/exams/:PathId/:Title/:TestId"
                element={
                    <Suspense fallback={<Layout><Loader /></Layout>}>
                        <Layout><PracticeExam /></Layout>
                    </Suspense>
                }
            />
            <Route
                path="/exam-review/:buyerTestId"
                element={
                    <Suspense fallback={<Layout><Loader /></Layout>}>
                        <Layout><ExamReview /></Layout>
                    </Suspense>
                }
            />
            <Route
                path="/contact"
                element={
                    <Suspense fallback={<Layout><Loader /></Layout>}>
                        <Layout><Contact /></Layout>
                    </Suspense>
                }
            />
            <Route path="/signup" element={
                <Suspense fallback={<Loader />}>
                    <SignUp />
                </Suspense>
            } />
            <Route path="*" element={
                <Suspense fallback={<Layout><Loader /></Layout>}>
                    <Layout><PageNotFound /></Layout>
                </Suspense>
            } />
        </Routes>
    );
}
