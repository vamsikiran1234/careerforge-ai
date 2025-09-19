import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { ForgotPasswordPage } from '@/components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage';
import AuthDebugPage from '@/components/auth/AuthDebugPage';
import EnvDebugPage from '@/components/debug/EnvDebugPage';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingPage } from '@/components/ui/Loading';

// Lazy load components for better performance
const DashboardPage = React.lazy(() => import('@/components/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ChatPage = React.lazy(() => import('./components/chat/ChatPage').then(module => ({ default: module.ChatPage })));
const QuizPageComponent = React.lazy(() => import('./components/quiz/QuizPage'));
const MentorsPage = React.lazy(() => import('./components/mentors/MentorsPage').then(module => ({ default: module.MentorsPage })));

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
      <ToastProvider>
        <ErrorBoundary>
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
                  path="/forgot-password"
                  element={
                    <PublicRoute>
                      <ForgotPasswordPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <PublicRoute>
                      <ResetPasswordPage />
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
                  <Route 
                    path="dashboard" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Dashboard..." />}>
                        <DashboardPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="chat" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Chat..." />}>
                        <ChatPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="quiz" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Quiz..." />}>
                        <QuizPageComponent />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="mentors" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Mentors..." />}>
                        <MentorsPage />
                      </Suspense>
                    } 
                  />
                  <Route index element={<Navigate to="/dashboard" replace />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
