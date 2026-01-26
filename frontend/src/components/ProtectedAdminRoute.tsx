import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

export const ProtectedAdminRoute: React.FC = () => {
  const { isAdmin, loading, availableRoles } = useRole();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.log('🔒 ProtectedAdminRoute: Check status', { loading, isAdmin, availableRoles });
    if (!loading) {
      setChecking(false);
    }
  }, [loading, isAdmin, availableRoles]);

  // Show loading state while checking admin status
  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if user is not an admin
  if (!isAdmin) {
    console.log('🚫 ProtectedAdminRoute: ACCESS DENIED', { isAdmin, availableRoles, loading });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            You need administrator privileges to access the Admin Portal.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Debug: Available roles: {availableRoles?.join(', ') || 'None'}
          </p>
          <div className="space-y-3">
            <a
              href="/app/dashboard"
              className="block w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Allow access to admin routes
  return <Outlet />;
};
