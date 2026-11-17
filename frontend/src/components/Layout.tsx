import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from './ui/ThemeToggle';
import { Menu } from 'lucide-react';
import { LogoSimple } from './ui/Logo';

export const Layout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar and headers on the chat route to provide a focused chat-only view
  const isChatPage = location.pathname.startsWith('/app/chat');

  if (isChatPage) {
    return (
      <div className="h-screen bg-[#090b10] text-zinc-100 chat-fullscreen overflow-hidden dark" style={{ '--global-sidebar-width': '0px' } as React.CSSProperties}>
        <Outlet />
      </div>
    );
  }

  // Format breadcrumb section title
  const currentSection = location.pathname === '/app/dashboard'
    ? 'Dashboard Overview'
    : location.pathname
        .replace('/app/', '')
        .split('/')[0]
        .replace('-', ' ');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Top Header - Student/Admin/Mentor Modes & Theme Toggle Side by Side at Top Right */}
        <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/80 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 capitalize">
              {currentSection}
            </span>
          </div>

          {/* Proper Top-Right Side-by-Side Controls */}
          <div className="flex items-center gap-2.5 ml-auto">
            <RoleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {/* Mobile Header (Only visible on small devices) */}
        <div className="flex items-center justify-between p-3.5 bg-white border-b border-gray-200 md:hidden dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <LogoSimple size={32} />
          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <ThemeToggle />
          </div>
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
