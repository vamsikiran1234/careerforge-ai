import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPass123!'
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Store auth token and user data
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('✅ Logged in successfully!');
        
        // Navigate to career page
        navigate('/app/career');
        window.location.reload();
      } else {
        console.error('❌ Login failed:', data.message);
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Login error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Quick Test Login
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Click the button below to log in as a test user and access the career features.
        </p>
        <button
          onClick={handleQuickLogin}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? 'Logging in...' : 'Login as Test User'}
        </button>
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          <p>Test credentials:</p>
          <p>Email: test@example.com</p>
          <p>Password: TestPass123!</p>
        </div>
      </div>
    </div>
  );
}