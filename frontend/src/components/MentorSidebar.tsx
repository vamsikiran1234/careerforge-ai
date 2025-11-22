import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MailPlus,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import { Badge } from './ui/Badge';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
}

export const MentorSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [menteesCount, setMenteesCount] = useState(0);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const location = useLocation();

  // Get auth token
  const getToken = (): string | null => {
    let token = localStorage.getItem('token');
    if (!token) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed.state?.token;
      }
    }
    return token;
  };

  // Fetch mentor stats
  const fetchStats = async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Fetch pending connections
      const connectionsResponse = await axios.get(
        `${API_URL}/mentorship/connections?status=PENDING`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (connectionsResponse.data.success) {
        setPendingCount(connectionsResponse.data.count || connectionsResponse.data.data?.length || 0);
      }

      // Fetch active mentees
      const menteesResponse = await axios.get(
        `${API_URL}/mentorship/connections?status=ACCEPTED`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (menteesResponse.data.success) {
        setMenteesCount(menteesResponse.data.count || menteesResponse.data.data?.length || 0);
      }

      // Fetch upcoming sessions
      const sessionsResponse = await axios.get(
        `${API_URL}/mentorship/sessions?status=SCHEDULED`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (sessionsResponse.data.success) {
        setUpcomingSessionsCount(sessionsResponse.data.count || sessionsResponse.data.data?.length || 0);
      }
    } catch (error) {
      console.debug('Error fetching mentor stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/mentor/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Connection Requests',
      href: '/mentor/connections',
      icon: MailPlus,
      badge: pendingCount,
    },
    {
      name: 'My Mentees',
      href: '/mentor/mentees',
      icon: Users,
      badge: menteesCount,
    },
    {
      name: 'Sessions',
      href: '/mentor/sessions',
      icon: Calendar,
      badge: upcomingSessionsCount,
    },
    {
      name: 'Availability',
      href: '/mentor/availability',
      icon: Clock,
    },
    {
      name: 'Earnings',
      href: '/mentor/earnings',
      icon: DollarSign,
    },
    {
      name: 'Profile',
      href: '/mentor/profile',
      icon: Settings,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-40 h-[calc(100vh-4rem)]
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          hidden lg:block
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 flex items-center justify-center w-6 h-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-wide uppercase">
                Mentor Portal
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    active
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 font-medium text-sm">{item.name}</span>
                    
                    {/* Badge */}
                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge > 99 ? '99+' : item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Collapsed state badge */}
                {isCollapsed && item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full px-1">
                    {item.badge > 9 ? '9+' : item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Portal Branding (bottom) */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                Mentor Portal
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Empowering the next generation
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Menu Button (shown on mobile) */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <button
          className="flex items-center justify-center w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors"
          aria-label="Open menu"
        >
          <LayoutDashboard className="h-6 w-6" />
        </button>
      </div>
    </>
  );
};
