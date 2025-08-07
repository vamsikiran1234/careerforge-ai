import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import AuthDebugPage from '@/components/auth/AuthDebugPage';
import EnvDebugPage from '@/components/debug/EnvDebugPage';
import { DashboardPage } from '@/components/DashboardPage';
import { ChatPage } from './components/chat/ChatPage';
import QuizPageComponent from './components/quiz/QuizPage';
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

// Temporary placeholder components
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
            <Route
              path="/debug-auth"
              element={<AuthDebugPage />}
            />
            <Route
              path="/debug-env"
              element={<EnvDebugPage />}
            />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="quiz" element={<QuizPageComponent />} />
              <Route path="mentors" element={<MentorsPage />} />
              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
