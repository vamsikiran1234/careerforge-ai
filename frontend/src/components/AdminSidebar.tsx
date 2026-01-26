import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  TrendingUp,
  Activity,
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

export const AdminSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingMentorsCount, setPendingMentorsCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
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

  // Fetch admin stats
  const fetchStats = async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Fetch pending mentors count
      const mentorsResponse = await axios.get(
        `${API_URL}/admin/mentors?status=PENDING`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (mentorsResponse.data.success) {
        setPendingMentorsCount(mentorsResponse.data.count || mentorsResponse.data.data?.length || 0);
      }

      // Fetch total users count
      const usersResponse = await axios.get(
        `${API_URL}/admin/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (usersResponse.data.success) {
        setTotalUsersCount(usersResponse.data.count || usersResponse.data.data?.length || 0);
      }
    } catch (error) {
      console.debug('Error fetching admin stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Increase interval to 5 minutes to reduce API calls
    const interval = setInterval(fetchStats, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const navigation: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      badge: totalUsersCount,
    },
    {
      name: 'Verify Mentors',
      href: '/admin/mentors',
      icon: UserCheck,
      badge: pendingMentorsCount,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
    },
    {
      name: 'Activity Monitor',
      href: '/admin/activity',
      icon: Activity,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
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
          className="absolute -right-3 top-6 z-50 flex items-center justify-center w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full py-6">
          {/* Portal Badge */}
          {!isCollapsed && (
            <div className="px-6 mb-6">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg text-center shadow-md">
                <span className="text-sm font-semibold">🛡️ Admin Portal</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group relative
                    ${
                      active
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    className={`
                      h-5 w-5 flex-shrink-0
                      ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400'}
                    `}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 font-medium text-sm">{item.name}</span>
                      {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                        <Badge variant={active ? 'default' : 'secondary'} size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}

                  {/* Collapsed State Badge */}
                  {isCollapsed && item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          {!isCollapsed && (
            <div className="px-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin Tools v1.0
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Overlay (for future mobile menu implementation) */}
      <div className="lg:hidden">
        {/* Mobile menu button can be added here */}
      </div>
    </>
  );
};
