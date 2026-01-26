import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';
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
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RoleProvider } from '@/contexts/RoleContext';
import { MentorPortalLayout } from '@/layouts/MentorPortalLayout';
import { AdminPortalLayout } from '@/layouts/AdminPortalLayout';
import { ProtectedMentorRoute } from '@/components/ProtectedMentorRoute';
import { ProtectedAdminRoute } from '@/components/ProtectedAdminRoute';
import { LandingPage } from '@/components/landing/LandingPage';

// Lazy load components for better performance
const DashboardPage = React.lazy(() => import('@/components/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ChatPage = React.lazy(() => import('./components/chat/ChatPage').then(module => ({ default: module.ChatPage })));
const ChatList = React.lazy(() => import('./components/chat/ChatList').then(module => ({ default: module.ChatList })));
const QuizPageComponent = React.lazy(() => import('./components/quiz/QuizPage'));
const MentorsPage = React.lazy(() => import('./components/mentors/MentorsPage').then(module => ({ default: module.MentorsPage })));
const MentorRegistrationPage = React.lazy(() => import('./components/mentorship/MentorRegistrationPage').then(module => ({ default: module.MentorRegistrationPage })));
const MentorVerificationPage = React.lazy(() => import('./components/mentorship/MentorVerificationPage').then(module => ({ default: module.MentorVerificationPage })));
const MyConnections = React.lazy(() => import('./components/connections/MyConnections').then(module => ({ default: module.MyConnections })));
const MentorConnections = React.lazy(() => import('./components/connections/MentorConnections').then(module => ({ default: module.MentorConnections })));
const MySessionsPage = React.lazy(() => import('./components/sessions/MySessionsPage').then(module => ({ default: module.default })));
const SessionBooking = React.lazy(() => import('./components/sessions/SessionBooking').then(module => ({ default: module.default })));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const SharedConversationView = React.lazy(() => import('./components/chat/SharedConversationView'));

// Admin Components
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard'));
const AdminMentorVerification = React.lazy(() => import('./components/admin/AdminMentorVerification').then(module => ({ default: module.AdminMentorVerification })));
const AdminUserManagement = React.lazy(() => import('./components/admin/AdminUserManagement'));
const AnalyticsCharts = React.lazy(() => import('./components/admin/AnalyticsCharts'));
const AdminActivityMonitor = React.lazy(() => import('./components/admin/AdminActivityMonitor').then(module => ({ default: module.AdminActivityMonitor })));
const AdminSettings = React.lazy(() => import('./components/admin/AdminSettings').then(module => ({ default: module.AdminSettings })));
const DebugRoles = React.lazy(() => import('./pages/DebugRoles'));

// Mentor Portal Components
const MentorDashboard = React.lazy(() => import('./pages/mentor/MentorDashboard').then(module => ({ default: module.MentorDashboard })));
const MentorMentees = React.lazy(() => import('./pages/mentor/MentorMentees').then(module => ({ default: module.MentorMentees })));
const MentorSessions = React.lazy(() => import('./pages/mentor/MentorSessions').then(module => ({ default: module.MentorSessions })));
const MentorAvailability = React.lazy(() => import('./pages/mentor/MentorAvailability').then(module => ({ default: module.MentorAvailability })));
const MentorEarnings = React.lazy(() => import('./pages/mentor/MentorEarnings').then(module => ({ default: module.MentorEarnings })));
const MentorProfile = React.lazy(() => import('./pages/mentor/MentorProfile').then(module => ({ default: module.MentorProfile })));

// Career Trajectory Components
const CareerTrajectoryDashboard = React.lazy(() => import('./components/career/CareerTrajectoryDashboard'));
const GoalCreationWizard = React.lazy(() => import('./components/career/wizard/GoalCreationWizard'));
const GoalDetailPage = React.lazy(() => import('./components/career/GoalDetailPage'));


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
  allowAuthenticated?: boolean; // Allow authenticated users on certain pages (like reset password)
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children, allowAuthenticated = false }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingPage message="Loading..." />;
  }

  // Don't redirect if allowAuthenticated is true (for reset password flow)
  if (isAuthenticated && !allowAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth, isLoading, token } = useAuthStore();
  const { clearAllSessions } = useChatStore();

  useEffect(() => {
    // Only check auth if we have a token in localStorage
    const hasStoredToken = !!token;
    if (hasStoredToken) {
      checkAuth();
    }

    // Expose clear function globally for easy access in console
    if (typeof window !== 'undefined') {
      interface WindowWithDevTools extends Window {
        __clearChatStorage?: () => void;
      }
      (window as WindowWithDevTools).__clearChatStorage = () => {
        clearAllSessions();
        console.log('✅ Chat storage cleared!');
        console.log('🔄 Reloading page...');
        window.location.reload();
      };
      
      console.log('💡 CareerForge AI Developer Tools:');
      console.log('   Run: __clearChatStorage()  - to clear all chat data');
    }
  }, [checkAuth, clearAllSessions, token]);

  if (isLoading) {
    return <LoadingPage message="Initializing CareerForge AI..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <ErrorBoundary>
            <Router>
              <RoleProvider>
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
                    <PublicRoute allowAuthenticated={true}>
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
                
                {/* Public mentor verification route */}
                <Route
                  path="/mentorship/verify/:token"
                  element={
                    <Suspense fallback={<LoadingPage message="Verifying email..." />}>
                      <MentorVerificationPage />
                    </Suspense>
                  }
                />

                {/* Landing Page - Public */}
                <Route 
                  path="/" 
                  element={
                    <PublicRoute>
                      <LandingPage />
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route path="/app" element={<ProtectedRoute />}>
                  <Route 
                    index
                    element={<Navigate to="/app/dashboard" replace />}
                  />
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
                  <Route 
                    path="connections" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Connections..." />}>
                        <MyConnections />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="messages" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Messages..." />}>
                        <ChatList />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="messages/:connectionId" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Messages..." />}>
                        <ChatList />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="sessions" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Sessions..." />}>
                        <MySessionsPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="sessions/book/:mentorId" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Booking..." />}>
                        <SessionBooking />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="mentorship/register" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Registration..." />}>
                        <MentorRegistrationPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="settings" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Settings..." />}>
                        <SettingsPage />
                      </Suspense>
                    } 
                  />
                  
                  {/* Career Trajectory Routes */}
                  <Route 
                    path="career" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Career Trajectory..." />}>
                        <CareerTrajectoryDashboard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="career/new" 
                    element={
                      <Suspense fallback={<LoadingPage message="Creating Goal..." />}>
                        <GoalCreationWizard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="career/:goalId/edit" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Editor..." />}>
                        <GoalCreationWizard />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="career/:goalId" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading Goal..." />}>
                        <GoalDetailPage />
                      </Suspense>
                    } 
                  />
                  

                  
                  {/* Debug Route */}
                  <Route 
                    path="debug-roles" 
                    element={
                      <Suspense fallback={<LoadingPage message="Loading..." />}>
                        <DebugRoles />
                      </Suspense>
                    } 
                  />
                  
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                </Route>
                
                {/* Mentor Portal Routes - Protected with ProtectedMentorRoute */}
                <Route element={<ProtectedMentorRoute />}>
                  <Route element={<MentorPortalLayout />}>
                    <Route 
                      path="mentor" 
                      element={<Navigate to="/mentor/dashboard" replace />} 
                    />
                    <Route 
                      path="mentor/dashboard" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Mentor Dashboard..." />}>
                          <MentorDashboard />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="mentor/connections" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Connections..." />}>
                          <MentorConnections />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="mentor/mentees" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Mentees..." />}>
                          <MentorMentees />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="mentor/sessions" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Sessions..." />}>
                          <MentorSessions />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="mentor/availability" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Availability..." />}>
                          <MentorAvailability />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="mentor/earnings" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Earnings..." />}>
                          <MentorEarnings />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="mentor/profile" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Profile..." />}>
                          <MentorProfile />
                        </Suspense>
                      } 
                    />
                  </Route>
                </Route>
                
                {/* Admin Portal Routes - Protected with ProtectedAdminRoute */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route element={<AdminPortalLayout />}>
                    <Route 
                      path="admin" 
                      element={<Navigate to="/admin/dashboard" replace />} 
                    />
                    <Route 
                      path="admin/dashboard" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Admin Dashboard..." />}>
                          <AdminDashboard />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/users" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading User Management..." />}>
                          <AdminUserManagement />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/mentors" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Mentor Verification..." />}>
                          <AdminMentorVerification />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/analytics" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Analytics..." />}>
                          <AnalyticsCharts />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/activity" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Activity Monitor..." />}>
                          <AdminActivityMonitor />
                        </Suspense>
                      } 
                    />
                    <Route 
                      path="admin/settings" 
                      element={
                        <Suspense fallback={<LoadingPage message="Loading Settings..." />}>
                          <AdminSettings />
                        </Suspense>
                      } 
                    />
                  </Route>
                </Route>
                
                {/* Public shared conversation route - no authentication required */}
                <Route 
                  path="/share/:shareCode" 
                  element={
                    <Suspense fallback={<LoadingPage message="Loading shared conversation..." />}>
                      <SharedConversationView />
                    </Suspense>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </RoleProvider>
          </Router>
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
