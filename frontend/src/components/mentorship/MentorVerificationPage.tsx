import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Loader2, GraduationCap } from 'lucide-react';
import axios from 'axios';

export const MentorVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      console.log('🔍 Verification started');
      console.log('Token from URL:', token);
      console.log('API URL:', import.meta.env.VITE_API_URL);
      
      if (!token) {
        console.error('❌ No token found in URL');
        setStatus('error');
        setMessage('Invalid verification link - no token found');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
        const fullUrl = `${apiUrl}/mentorship/verify/${token}`;
        
        console.log('📡 Making verification request to:', fullUrl);
        
        const response = await axios.get(fullUrl);

        console.log('✅ Verification response:', response.data);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed');
        }
      } catch (err: any) {
        console.error('❌ Verification error:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        console.error('Request URL:', err.config?.url);
        
        setStatus('error');
        
        let errorMessage = 'Failed to verify email. ';
        
        if (err.response?.status === 400) {
          errorMessage += 'Invalid or expired verification token.';
        } else if (err.response?.status === 404) {
          errorMessage += 'Verification endpoint not found.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage += 'The link may have expired or is invalid.';
        }
        
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-primary-600">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Email Verification
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {status === 'loading' && 'Verifying Your Email'}
              {status === 'success' && 'Verification Successful!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              {status === 'loading' && (
                <>
                  <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Please wait while we verify your email...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium text-center mb-2">
                    {message}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                    An admin will review your profile shortly. You'll be notified once approved!
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      className="w-full"
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      onClick={() => navigate('/app/mentorship/profile')} 
                      variant="outline"
                      className="w-full"
                    >
                      View My Profile
                    </Button>
                  </div>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium text-center mb-2">
                    {message}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-6">
                    Please try registering again or contact support if the problem persists.
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      onClick={() => navigate('/app/mentorship/register')} 
                      className="w-full"
                    >
                      Register Again
                    </Button>
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      variant="outline"
                      className="w-full"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
