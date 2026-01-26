import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { RoleSwitcher } from '../components/RoleSwitcher';

export const AdminPortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Portal Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Portal
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
