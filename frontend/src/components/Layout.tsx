import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { RoleSwitcher } from './RoleSwitcher';
import { Menu } from 'lucide-react';
import { LogoSimple } from './ui/Logo';

export const Layout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar and headers on the chat route to provide a focused chat-only view
  const isChatPage = location.pathname.startsWith('/app/chat');

  if (isChatPage) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 chat-fullscreen" style={{ '--global-sidebar-width': '0px' } as React.CSSProperties}>
        <Outlet />
      </div>
    );
  }

  // Always show sidebar and main content, even on chat page

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 md:hidden dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <LogoSimple size={32} />
          <RoleSwitcher />
        </div>

        {/* Desktop Header - Role Switcher */}
        <div className="items-center justify-end hidden p-4 bg-white border-b border-gray-200 md:flex dark:bg-gray-800 dark:border-gray-700">
          <RoleSwitcher />
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
