import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useToast } from '@/components/ui/Toast';
import { isValidEmail } from '@/utils';
import { Info } from 'lucide-react';
import type { LoginForm } from '@/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, clearError } = useAuthStore();
  const toast = useToast();
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [messageShown, setMessageShown] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Check for success message from registration (only once)
  useEffect(() => {
    if (location.state?.message && !messageShown) {
      toast.success(location.state.message);
      setMessageShown(true);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast, messageShown]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = 'Please enter your email address';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@example.com)';
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
    
    console.log('🔵 Login form submitted:', { email: formData.email });

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, calling login...');
    try {
      const success = await login(formData);
      console.log('📊 Login result:', success);
      
      if (success) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        // Error from auth store
        const errorMessage = useAuthStore.getState().error || 'Unable to sign in. Please check your credentials and try again.';
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Unable to sign in. Please check your credentials and try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth store error when user starts typing
    clearError();
  };

  const handleUseDemoCredentials = () => {
    setFormData({
      email: 'demo.user@careerforge.ai',
      password: 'CareerForge@Demo2026'
    });
    setErrors({});
    clearError();
    toast.info('Demo credentials loaded. Click "Sign in" to continue.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <BrandLogo size="xl" variant="default" theme="gradient" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back to CareerForge AI
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo Credentials Section */}
            {!showDemoCredentials ? (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowDemoCredentials(true)}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Info className="w-4 h-4" />
                  <span>Try Demo Account</span>
                </button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-blue-900">
                        Try Demo Account
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowDemoCredentials(false)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Hide
                      </button>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">
                      Test the platform without creating an account:
                    </p>
                    <div className="bg-white rounded border border-blue-200 p-3 mb-3 font-mono text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900 font-medium">demo.user@careerforge.ai</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Password:</span>
                        <span className="text-gray-900 font-medium">CareerForge@Demo2026</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseDemoCredentials}
                      className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Use Demo Credentials
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}

              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Create new account
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
