import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from '@shared/components/layout/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import MockExams from '../pages/MockExams';
import ExamTopics from '../pages/ExamTopics';
import Practice from '../pages/PracticeExam';
import Contact from '../pages/Contact';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import { LoadingProvider } from '@shared/contexts/LoadingContext';
import Loader from '@shared/components/layout/Loader';
import { AuthProvider, useAuth } from '@features/auth/context/AuthContext';
import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import { LoginModalProvider } from '@features/auth/context/LoginModalContext';
import LoginModal from '../components/auth/LoginModal';
import PracticeExam from '../pages/PracticeExam';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

function App() {
    return (
        <LoadingProvider>
            <Router>
                <LoginModalProvider>
                    <AuthProvider>
                        <Loader />
                        <ScrollToTop />
                        <LoginModal />
                        <AuthRoutes />
                    </AuthProvider>
                </LoginModalProvider>
            </Router>
        </LoadingProvider>
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
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                }
            />
            {/** Exam Reports now rendered as a tab inside Dashboard; route removed **/}
            <Route
                path="/mock-exams"
                element={<Layout><MockExams /></Layout>}
            />
            <Route
                path="/exams/:PathId"
                element={<Layout><ExamTopics /></Layout>}
            />
            <Route
                path="/exams/:PathId/:Title/:TestId"
                element={<Layout><PracticeExam /></Layout>}
            />
            <Route
                path="/contact"
                element={<Layout><Contact /></Layout>}
            />
            <Route path="/signup" element={<SignUp />} />
        </Routes>
    );
}
