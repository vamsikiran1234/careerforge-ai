import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { RoleSwitcher } from './RoleSwitcher';
import { ThemeToggle } from './ui/ThemeToggle';
import { FloatingAIChat } from './chat/FloatingAIChat';
import { Menu, Sparkles } from 'lucide-react';
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

  const handleToggleChat = () => {
    window.dispatchEvent(new CustomEvent('toggle-ai-chat'));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
        {/* Top Header - AI Chatbot Icon, Student/Admin/Mentor Modes & Theme Toggle Side by Side at Top Right */}
        <header className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700/80 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {currentSection}
            </span>
          </div>

          {/* Proper Top-Right Side-by-Side Controls */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* AI Chatbot Icon Trigger in Header */}
            <button
              onClick={handleToggleChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-all shadow-xs"
              title="Open AI Chat Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Chat</span>
            </button>
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
            <button
              onClick={handleToggleChat}
              className="p-1.5 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              title="Open AI Chat Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>
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

        {/* App-wide Floating AI Chatbot Icon & Drawer */}
        <FloatingAIChat />
      </div>
    </div>
  );
};
