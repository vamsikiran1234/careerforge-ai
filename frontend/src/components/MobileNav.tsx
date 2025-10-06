import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  Home,
  X,
  Link2,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { Logo } from './ui/Logo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Career Quiz', href: '/quiz', icon: BookOpen },
  { name: 'Find Mentors', href: '/mentors', icon: Users },
  { name: 'My Connections', href: '/connections', icon: Link2 },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'My Sessions', href: '/sessions', icon: Calendar },
  { name: 'Become a Mentor', href: '/mentorship/register', icon: GraduationCap },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 shadow-xl z-50 md:hidden transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <Link to="/dashboard" className="flex items-center" onClick={onClose}>
            <Logo size="md" variant="full" />
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
