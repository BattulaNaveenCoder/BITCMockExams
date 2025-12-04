import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import MockExams from './pages/MockExams';
import Contact from './pages/Contact';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// Scroll to top on route change
function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

function App() {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* Routes with Layout */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/mock-exams" element={<Layout><MockExams /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />

                {/* Auth Routes (no header/footer) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Routes>
        </Router>
    );
}

export default App;
