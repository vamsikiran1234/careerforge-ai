import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/store/auth';
import { isAdmin } from '@/utils/roleHelpers';
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
  Shield,
  Link2,
  Target
} from 'lucide-react';
import { Logo } from './ui/Logo';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'AI Chat', href: '/app/chat', icon: MessageSquare },
  { name: 'Career Quiz', href: '/app/quiz', icon: BookOpen },
  { name: 'Career Trajectory', href: '/app/career', icon: Target },
  { name: 'Find Mentors', href: '/app/mentors', icon: Users },
  { name: 'My Connections', href: '/app/connections', icon: Link2 },
  { name: 'Messages', href: '/app/messages', icon: MessageSquare },
  { name: 'My Sessions', href: '/app/sessions', icon: Calendar },
  { name: 'Become a Mentor', href: '/app/mentorship/register', icon: GraduationCap },
];

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/app/admin', icon: Shield },
  { name: 'Verify Mentors', href: '/app/admin/mentors', icon: UserCheck },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  
  const userIsAdmin = isAdmin(user);

  // Check if user is a mentor
  useEffect(() => {
    checkMentorStatus();
  }, [user]);

  const checkMentorStatus = async () => {
    if (!user) {
      setIsMentor(false);
      return;
    }

    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
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
        
        {/* Admin Section */}
        {userIsAdmin && (
          <>
            {!isCollapsed && (
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="px-4 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                  Admin
                </p>
              </div>
            )}
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
                    isCollapsed && 'justify-center'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'
                  )} />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        {/* Settings */}
        <Link
          to="/app/settings"
          className={cn(
            'flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          {!isCollapsed && (
            <span className="text-sm text-gray-700 dark:text-gray-300">Settings</span>
          )}
        </Link>

        {/* Logout Button */}
        <div className="p-4">
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 w-full text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsed Logout Button */}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full p-3 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
};
