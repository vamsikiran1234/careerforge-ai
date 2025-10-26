import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { LoadingPage } from '@/components/ui/Loading';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingPage message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

// Public Route Component (redirect to dashboard if already authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingPage message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Component
const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Your AI-powered career guidance dashboard
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Chat Assistant
          </h3>
          <p className="text-gray-600 mb-4">
            Get personalized career advice and guidance
          </p>
          <a
            href="/chat"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Start chatting →
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Career Assessment
          </h3>
          <p className="text-gray-600 mb-4">
            Take our comprehensive quiz to discover your path
          </p>
          <a
            href="/quiz"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Take quiz →
          </a>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Find Mentors
          </h3>
          <p className="text-gray-600 mb-4">
            Connect with industry experts and mentors
          </p>
          <a
            href="/mentors"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Browse mentors →
          </a>
        </div>
      </div>
    </div>
  );
};

// Temporary placeholder components
const ChatPage: React.FC = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Chat Assistant</h1>
    <p className="text-gray-600">Chat interface coming soon...</p>
  </div>
);

const QuizPage: React.FC = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Career Assessment Quiz</h1>
    <p className="text-gray-600">Quiz interface coming soon...</p>
  </div>
);

const MentorsPage: React.FC = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Mentors</h1>
    <p className="text-gray-600">Mentor discovery coming soon...</p>
  </div>
);

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app start
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingPage message="Initializing CareerForge AI..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="mentors" element={<MentorsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
