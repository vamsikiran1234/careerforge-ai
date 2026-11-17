import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useToast } from '@/components/ui/Toast';
import { isValidEmail, validatePassword } from '@/utils';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Check,
  GraduationCap
} from 'lucide-react';
import type { RegisterForm } from '@/types';
import { cn } from '@/utils';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, clearError } = useAuthStore();
  const toast = useToast();

  const [formData, setFormData] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});

  // Real-time password requirement checks
  const passwordValidation = {
    hasMinLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[@$!%*?&]/.test(formData.password),
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};

    if (!formData.name) {
      newErrors.name = 'Please enter your full name';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter a password';
    } else {
      const val = validatePassword(formData.password);
      if (!val.isValid) {
        newErrors.password = val.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        toast.success('Account created! Welcome to CareerForge AI.');
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please sign in with your credentials.',
          },
        });
      } else {
        const errorMessage = useAuthStore.getState().error || 'Unable to create account. Please try again.';
        toast.error(errorMessage);
      }
    } catch {
      toast.error('Unable to create account. Please check your connection.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#090b11] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Left Column: Sign Up Form */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-16 xl:px-24 py-10 max-w-2xl mx-auto lg:max-w-none w-full">
        {/* Top Brand Link */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrandLogo size="md" variant="default" />
          </Link>
        </div>

        {/* Center Content Form */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Start your adaptive career assessments and connect with verified tech mentors.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Alex Mercer"
                  className={cn(
                    'block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                    errors.name
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  )}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="alex@example.com"
                  className={cn(
                    'block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                    errors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  )}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                  className={cn(
                    'block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-all outline-none',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                    errors.password
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Requirements Checkmarks */}
              {formData.password && (
                <div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className={cn('flex items-center gap-1', passwordValidation.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : '')}>
                    <Check className="h-3 w-3" /> 8+ characters
                  </span>
                  <span className={cn('flex items-center gap-1', passwordValidation.hasUpper && passwordValidation.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : '')}>
                    <Check className="h-3 w-3" /> Upper & lowercase
                  </span>
                  <span className={cn('flex items-center gap-1', passwordValidation.hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : '')}>
                    <Check className="h-3 w-3" /> One number
                  </span>
                  <span className={cn('flex items-center gap-1', passwordValidation.hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : '')}>
                    <Check className="h-3 w-3" /> Special character (@$!%*?&)
                  </span>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repeat your password"
                  className={cn(
                    'block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border transition-all outline-none',
                    'bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-600/25 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Mentor Link */}
        <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-between">
          <Link to="/mentorship/register" className="hover:underline flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Are you an engineer? Apply as Mentor</span>
          </Link>
          <Link to="/" className="hover:underline">Home</Link>
        </div>
      </div>

      {/* Right Column: High-End Brand & Trajectory Showcase (Desktop Only) */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#0a0d14] via-[#0e1320] to-[#12192c] text-white p-12 flex-col justify-between border-l border-gray-800/80 overflow-hidden">
        {/* Ambient Subtle Grid Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

        {/* Top Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-blue-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Structured Path to Hire</span>
          </div>
          <span className="text-xs font-mono text-gray-400">Free Starter Tier</span>
        </div>

        {/* Center Live Trajectory Mockup Card */}
        <div className="relative z-10 max-w-md mx-auto my-auto w-full space-y-4">
          <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  5-Stage Adaptive Evaluation
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Instant diagnosis across 5 technical tiers
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-gray-300">Stage 1: Core Fundamentals</span>
                <span className="text-emerald-400 font-semibold">100% Benchmarked</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-gray-300">Stage 2: Algorithmic Logic</span>
                <span className="text-emerald-400 font-semibold">Adaptive Calibrated</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between">
                <span className="text-gray-300">Stage 3: System Architecture</span>
                <span className="text-blue-400 font-semibold">High-Order Reasoning</span>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300 italic">
            "No canned roadmaps. CareerForge identified my specific gaps in Docker and PostgreSQL, guided me through target projects, and connected me with an engineering mentor."
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
          <div>
            <p className="font-bold text-white">Free Access</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Start instantly</p>
          </div>
          <div>
            <p className="font-bold text-white">Adaptive</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Zero static repetition</p>
          </div>
          <div>
            <p className="font-bold text-white">Verified</p>
            <p className="text-[11px] text-gray-400 mt-0.5">1-on-1 industry sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
