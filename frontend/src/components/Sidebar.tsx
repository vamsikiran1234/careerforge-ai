import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';
import { 
  MessageSquare, 
  BookOpen, 
  Users, 
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCheck,
  GraduationCap,
  Calendar,
  Target
} from 'lucide-react';
import { Logo } from './ui/Logo';
import { getValidAuthToken } from '@/lib/api-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Career Quiz', href: '/app/quiz', icon: BookOpen },
  { name: 'Career Trajectory', href: '/app/career', icon: Target },
  { name: 'Find Mentors', href: '/app/mentors', icon: Users },
  { name: 'Messages', href: '/app/messages', icon: MessageSquare },
  { name: 'My Sessions', href: '/app/sessions', icon: Calendar },
  { name: 'Become a Mentor', href: '/app/mentorship/register', icon: GraduationCap },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const checkMentorStatus = async () => {
    if (!user) {
      setIsMentor(false);
      return;
    }

    try {
      const token = getValidAuthToken();
      if (!token) {
        setIsMentor(false);
        return;
      }

      const response = await axios.get(`${API_URL}/mentorship/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // User is a mentor if they have a profile with status ACTIVE or PENDING
      if (response.data.success && response.data.data) {
        const profile = response.data.data;
        setIsMentor(profile.status === 'ACTIVE' || profile.status === 'PENDING');
      } else {
        setIsMentor(false);
      }
    } catch {
      // If 404, user is not a mentor
      setIsMentor(false);
    }
  };

  // Check if user is a mentor - only run once on mount
  useEffect(() => {
    let mounted = true;
    if (mounted && user) {
      checkMentorStatus();
    }
    return () => { mounted = false; };
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <Link to="/app/dashboard" className="flex items-center">
            <Logo size="md" variant="full" />
          </Link>
        ) : (
          <Link to="/app/dashboard" className="flex items-center justify-center flex-1">
            <Logo size="md" variant="icon" />
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                'h-5 w-5 flex-shrink-0',
                isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              )} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
        
        {/* My Connections - For Students (when not viewing as mentor) */}
        {!isMentor && (
          <Link
            to="/app/connections"
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
              location.pathname === '/app/connections'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'My Connections' : undefined}
          >
            <UserCheck className={cn(
              'h-5 w-5 flex-shrink-0',
              location.pathname === '/app/connections' ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
            )} />
            {!isCollapsed && (
              <span className="text-sm font-medium">My Connections</span>
            )}
          </Link>
        )}
      </nav>

      {/* Bottom Section: Settings & Logout */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2 space-y-1">
        {/* Settings */}
        <Link
          to="/app/settings"
          className={cn(
            'flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300',
            location.pathname.startsWith('/app/settings') && 'bg-gray-100 dark:bg-gray-800 font-semibold',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium">Settings</span>
          )}
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left',
            isCollapsed && 'justify-center px-0'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};
