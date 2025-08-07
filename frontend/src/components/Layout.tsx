import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth';
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  Home,
  LogOut,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Career Quiz', href: '/quiz', icon: BookOpen },
  { name: 'Find Mentors', href: '/mentors', icon: Users, disabled: true },
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <span className="text-sm font-bold text-white">CF</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  CareerForge AI
                </span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                
                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Soon
                      </span>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'inline-flex items-center px-1 pt-1 text-sm font-medium',
                      isActive
                        ? 'border-b-2 border-primary-500 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="border-t border-gray-200 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              
              if (item.disabled) {
                return (
                  <div
                    key={item.name}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                      <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Soon
                      </span>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'block rounded-md px-3 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
