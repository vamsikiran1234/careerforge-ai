import React from 'react';
import { Outlet } from 'react-router-dom';
import { MentorSidebar } from '@/components/MentorSidebar';
import { RoleSwitcher } from '../components/RoleSwitcher';


export const MentorPortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Mentor Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <RoleSwitcher />
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <MentorSidebar />
        <main className="flex-1 lg:ml-64">
          <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Portal Badge */}
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Mentor Portal
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
