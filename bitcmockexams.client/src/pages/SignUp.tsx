import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import Button from '@shared/components/ui/Button';
import Input from '@shared/components/ui/Input';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'password') {
            calculatePasswordStrength(value);
        }

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const calculatePasswordStrength = (password: string) => {
        if (password.length === 0) {
            setPasswordStrength('');
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 1) setPasswordStrength('weak');
        else if (strength <= 2) setPasswordStrength('medium');
        else setPasswordStrength('strong');
    };

    const getStrengthClass = (strength: string) => {
        switch (strength) {
            case 'weak': return 'w-1/3 bg-error';
            case 'medium': return 'w-2/3 bg-warning';
            case 'strong': return 'w-full bg-success';
            default: return '';
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
            alert('Account created successfully!');
            navigate('/');
            setIsSubmitting(false);
        }, 1500);
    };

    const handleSocialSignup = (provider: string) => {
        alert(`Sign up with ${provider} - Feature coming soon!`);
    };

    return (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]">
            <div className="w-full max-w-[480px] px-4">
                <div className="bg-white rounded-xl shadow-xl p-12 md:p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                        <p className="text-text-secondary m-0">Join thousands of successful cloud professionals</p>
                    </div>

                    <form onSubmit={handleSubmit} className="mb-6">
                        <Input
                            label="Full Name"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={errors.fullName}
                            placeholder="John Doe"
                            required
                        />

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
                            placeholder="Create a strong password"
                            required
                        />

                        {passwordStrength && (
                            <div className="mt-2">
                                <div className="h-1 bg-bg-gray rounded-sm overflow-hidden mb-2">
                                    <div className={`h-full transition-all duration-250 ${getStrengthClass(passwordStrength)}`}></div>
                                </div>
                                <p className="text-xs text-text-secondary">
                                    Password strength: <strong>{passwordStrength}</strong>
                                </p>
                            </div>
                        )}

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            placeholder="Re-enter your password"
                            required
                        />

                        <div className="mb-6">
                            <label className="flex items-start gap-2 cursor-pointer text-sm">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleChange}
                                />
                                <span className="leading-relaxed">
                                    I agree to the <Link to="/terms" className="text-primary-blue font-semibold">Terms of Service</Link> and{' '}
                                    <Link to="/privacy" className="text-primary-blue font-semibold">Privacy Policy</Link>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <span className="block mt-1 text-sm text-error">{errors.agreeToTerms}</span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            loading={isSubmitting}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="relative text-center my-6 before:content-[''] before:absolute before:top-1/2 before:left-0 before:right-0 before:h-px before:bg-border">
                        <span className="relative bg-white px-4 text-text-light text-sm font-semibold">OR</span>
                    </div>

                    <div className="flex flex-col gap-4 mb-6">
                        <button
                            className="flex items-center justify-center gap-4 px-6 py-3 border-2 border-border bg-white rounded-md font-semibold cursor-pointer transition-all duration-250 hover:border-primary-blue hover:bg-light-blue"
                            onClick={() => handleSocialSignup('Google')}
                        >
                            <FaGoogle className="text-[#DB4437]" /> Sign up with Google
                        </button>
                        <button
                            className="flex items-center justify-center gap-4 px-6 py-3 border-2 border-border bg-white rounded-md font-semibold cursor-pointer transition-all duration-250 hover:border-primary-blue hover:bg-light-blue"
                            onClick={() => handleSocialSignup('Microsoft')}
                        >
                            <FaMicrosoft className="text-[#00A4EF]" /> Sign up with Microsoft
                        </button>
                    </div>

                    <div className="text-center pt-6 border-t border-border">
                        <p className="text-text-secondary m-0">
                            Already have an account? <Link to="/login" className="text-primary-blue font-semibold">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
