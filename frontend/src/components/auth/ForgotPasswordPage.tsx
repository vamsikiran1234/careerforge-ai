import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useToast } from '@/components/ui/Toast';
import { isValidEmail } from '@/utils';
import { apiClient } from '@/lib/api-client';
import { ArrowLeft, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/utils';

export const ForgotPasswordPage: React.FC = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (response.status === 'success') {
        toast.success('Password reset link dispatched to your inbox.');
        setIsSubmitted(true);
        if (response.data && typeof response.data === 'object' && 'previewUrl' in response.data) {
          setPreviewUrl((response.data as { previewUrl?: string }).previewUrl || '');
        }
      } else {
        toast.error(response.message || 'Unable to send reset email. Please try again.');
      }
    } catch {
      toast.error('An error occurred while sending the reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/70 dark:bg-[#090b11] text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex justify-center hover:opacity-90 transition-opacity">
            <BrandLogo size="lg" variant="default" />
          </Link>
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">
            {isSubmitted ? 'Check your email' : 'Reset your password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSubmitted
              ? `We have sent a secure password reset link to ${email}`
              : "Enter your registered email and we'll send you recovery instructions."}
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    className={cn(
                      'block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border transition-all outline-none',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
                      'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                    )}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-60 shadow-md shadow-blue-600/25 transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              {previewUrl && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-xs">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Development Preview:</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold underline"
                  >
                    View Reset Email Link ↗
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setPreviewUrl('');
                }}
                className="w-full py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Send to another email
              </button>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
