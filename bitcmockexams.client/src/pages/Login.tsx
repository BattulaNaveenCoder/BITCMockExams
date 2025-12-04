import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            alert('Login successful!');
            navigate('/');
            setIsSubmitting(false);
        }, 1500);
    };

    const handleSocialLogin = (provider: string) => {
        alert(`Login with ${provider} - Feature coming soon!`);
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]">
            <div className="w-full max-w-[480px] px-4">
                <div className="bg-white rounded-xl shadow-xl p-12 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-text-secondary m-0">Login to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Enter your password"
                            required
                        />

                        <div className="flex justify-between items-center mb-6 md:flex-col md:items-start md:gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-primary-blue text-sm font-semibold">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isSubmitting}
                        >
                            Login
                        </Button>
                    </form>

                    <div className="relative text-center my-6 before:content-[''] before:absolute before:top-1/2 before:left-0 before:right-0 before:h-px before:bg-border">
                        <span className="relative bg-white px-4 text-text-light text-sm font-semibold">OR</span>
                    </div>

                    <div className="flex flex-col gap-4 mb-6">
                        <button
                            className="flex items-center justify-center gap-4 px-6 py-3 border-2 border-border bg-white rounded-md font-semibold cursor-pointer transition-all duration-250 hover:border-primary-blue hover:bg-light-blue"
                            onClick={() => handleSocialLogin('Google')}
                        >
                            <FaGoogle className="text-[#DB4437]" /> Continue with Google
                        </button>
                        <button
                            className="flex items-center justify-center gap-4 px-6 py-3 border-2 border-border bg-white rounded-md font-semibold cursor-pointer transition-all duration-250 hover:border-primary-blue hover:bg-light-blue"
                            onClick={() => handleSocialLogin('Microsoft')}
                        >
                            <FaMicrosoft className="text-[#00A4EF]" /> Continue with Microsoft
                        </button>
                    </div>

                    <div className="text-center pt-6 border-t border-border">
                        <p className="text-text-secondary m-0">
                            Don't have an account? <a href="https://www.bestitcourses.com/" target="_blank" rel="noopener noreferrer" className="text-primary-blue font-semibold">Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
