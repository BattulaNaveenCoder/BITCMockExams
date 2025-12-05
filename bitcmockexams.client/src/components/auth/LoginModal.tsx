import React, { useEffect, useMemo, useState } from 'react';
import { FaGoogle, FaMicrosoft, FaTimes } from 'react-icons/fa';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useLoginModal } from '@features/auth/context/LoginModalContext';
import { useAuth } from '@features/auth/context/AuthContext';
import { useAuthApi } from '../../shared/api/auth';

const base64Url = (obj: any) => {
  const json = JSON.stringify(obj);
  const b64 = typeof window === 'undefined' ? Buffer.from(json).toString('base64') : window.btoa(json);
  return b64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const createFakeJwt = (email: string) => {
  const header = { alg: 'none', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { exp: now + 60 * 60, nbf: now - 5, email };
  return `${base64Url(header)}.${base64Url(payload)}.`;
};

const LoginModal: React.FC = () => {
  const { isOpen, close, returnUrl } = useLoginModal();
  const { login } = useAuth();
  const authApi = useAuthApi();

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: '', password: '', rememberMe: false });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = useMemo(
    () => () => {
      const errs: Record<string, string> = {};
      if (!formData.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email is invalid';
      if (!formData.password) errs.password = 'Password is required';
      else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
      return errs;
    },
    [formData]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        username: formData.email,
        password: formData.password,
        isrememberme: String(formData.rememberMe),
      } as Record<string, unknown>;

      const result: any = await authApi.login(payload, true);
      debugger;
      if (!result?.isSuccess) {
        throw new Error(result?.message || 'Login failed.');
      }
      const token = result?.data?.token as string | undefined;
      if (!token) {
        throw new Error('Token missing in response');
      }
      login(token, returnUrl);
      close();
    } catch (err: any) {
      setErrors((p) => ({ ...p, form: err?.message || 'Login failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Login with ${provider} - Feature coming soon!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 px-4" onMouseDown={onBackdrop}>
      <div className="relative w-full max-w-[520px] bg-white rounded-xl shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <button aria-label="Close" className="absolute right-4 top-4 text-text-secondary hover:text-text-primary" onClick={close}>
          <FaTimes />
        </button>
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
            <p className="text-text-secondary m-0">Login to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mb-5">
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
                <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary-blue text-sm font-semibold" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            {errors.form && (
              <p className="text-red-600 text-sm mb-3">{errors.form}</p>
            )}
            <Button type="submit" variant="primary" size="large" fullWidth loading={isSubmitting}>
              Login
            </Button>
          </form>

          <div className="relative text-center my-5 before:content-[''] before:absolute before:top-1/2 before:left-0 before:right-0 before:h-px before:bg-border">
            <span className="relative bg-white px-4 text-text-light text-sm font-semibold">OR</span>
          </div>

          <div className="flex flex-col gap-3 mb-2">
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

          <div className="text-center pt-4 border-t border-border">
            <p className="text-text-secondary m-0">
              Don't have an account?{' '}
              <a href="https://www.bestitcourses.com/" target="_blank" rel="noopener noreferrer" className="text-primary-blue font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
