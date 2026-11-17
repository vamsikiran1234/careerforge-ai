import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useToast } from '@/components/ui/Toast';
import { isValidEmail } from '@/utils';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import type { LoginForm } from '@/types';
import { cn } from '@/utils';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError } = useAuthStore();
  const toast = useToast();

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [messageShown, setMessageShown] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message && !messageShown) {
      toast.success(location.state.message);
      setMessageShown(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast, messageShown]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password';
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
      const success = await login(formData);
      if (success) {
        toast.success('Welcome back!');
        navigate('/app/dashboard');
      } else {
        const errorMessage = useAuthStore.getState().error || 'Invalid email or password. Please try again.';
        toast.error(errorMessage);
      }
    } catch {
      toast.error('Unable to sign in. Please check your network connection.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  const handleUseDemo = () => {
    setFormData({
      email: 'demo.user@careerforge.ai',
      password: 'CareerForge@Demo2026',
    });
    setErrors({});
    clearError();
    setIsDemoActive(true);
    toast.info('Demo credentials loaded. Click "Sign In" to explore.');
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#090b11] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Left Column: Sign In Form */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-16 xl:px-24 py-10 max-w-2xl mx-auto lg:max-w-none w-full">
        {/* Top Brand Link */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrandLogo size="md" variant="default" />
          </Link>
        </div>

        {/* Center Content Form */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to continue your adaptive career sprints and mentorship sessions.
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3 rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  Want to explore first?
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {isDemoActive ? 'Demo loaded · demo.user@careerforge.ai' : 'Instant 1-click test student session'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseDemo}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs',
                isDemoActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-700'
              )}
            >
              {isDemoActive ? 'Loaded ✓' : 'Auto-Fill Demo'}
            </button>
          </div>

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="name@example.com"
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
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
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
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-600/25 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Status / Help */}
        <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-between">
          <span>CareerForge AI Platform</span>
          <Link to="/" className="hover:underline">Back to Home</Link>
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
            <span>AI Trajectory Intelligence</span>
          </div>
          <span className="text-xs font-mono text-gray-400">v2.5 Production</span>
        </div>

        {/* Center Live Trajectory Mockup Card */}
        <div className="relative z-10 max-w-md mx-auto my-auto w-full space-y-4">
          <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                  Target Trajectory
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Applied AI Systems Engineer
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                74% Complete
              </span>
            </div>

            {/* Progress Track */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Milestone 3 of 4: RAG & pgvector</span>
                <span className="text-white font-semibold">Active Sprint</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-[74%]" />
              </div>
            </div>

            {/* Verified Mentor Match Snippet */}
            <div className="p-3.5 rounded-xl bg-white/[0.05] border border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                MV
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">Marcus Vance</p>
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                </div>
                <p className="text-[11px] text-gray-400 truncate">Staff AI Engineer · Mentor</p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Verified
              </span>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300 italic">
            "CareerForge tested my actual code and architecture reasoning instead of asking multiple-choice trivia. I knew exactly what to build to land my current role."
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
          <div>
            <p className="font-bold text-white">Adaptive</p>
            <p className="text-[11px] text-gray-400 mt-0.5">5-stage difficulty</p>
          </div>
          <div>
            <p className="font-bold text-white">Verified</p>
            <p className="text-[11px] text-gray-400 mt-0.5">1-on-1 industry mentors</p>
          </div>
          <div>
            <p className="font-bold text-white">Actionable</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Step-by-step roadmap</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
