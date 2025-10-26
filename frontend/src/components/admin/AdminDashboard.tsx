import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Star,
  TrendingUp,
  MessageSquare,
  Link,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { ScreenshotManager } from './ScreenshotManager';

interface PlatformStats {
  users: {
    total: number;
    newLast30Days: number;
    growth: string;
  };
  mentors: {
    total: number;
    verified: number;
    pending: number;
  };
  sessions: {
    total: number;
    completed: number;
    completionRate: string;
  };
  engagement: {
    totalConnections: number;
    totalMessages: number;
    totalReviews: number;
    averageRating: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/analytics/platform`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data.stats);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch platform stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users.total || 0,
      change: stats?.users.growth || '0%',
      icon: Users,
      color: 'blue',
      subtext: `+${stats?.users.newLast30Days || 0} this month`,
      trend: parseFloat(stats?.users.growth || '0') > 0 ? 'up' : 'down',
    },
    {
      title: 'Active Mentors',
      value: stats?.mentors.verified || 0,
      change: `${stats?.mentors.pending || 0} pending`,
      icon: UserCheck,
      color: 'green',
      subtext: `${stats?.mentors.total || 0} total mentors`,
      trend: 'neutral',
    },
    {
      title: 'Total Sessions',
      value: stats?.sessions.total || 0,
      change: stats?.sessions.completionRate || '0%',
      icon: Calendar,
      color: 'purple',
      subtext: `${stats?.sessions.completed || 0} completed`,
      trend: parseFloat(stats?.sessions.completionRate || '0') > 90 ? 'up' : 'neutral',
    },
    {
      title: 'Average Rating',
      value: stats?.engagement.averageRating || '0.0',
      change: `${stats?.engagement.totalReviews || 0} reviews`,
      icon: Star,
      color: 'yellow',
      subtext: 'Platform satisfaction',
      trend: parseFloat(stats?.engagement.averageRating || '0') > 4.5 ? 'up' : 'neutral',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage all platform users',
      icon: Users,
      color: 'blue',
      route: '/admin/users',
    },
    {
      title: 'Mentor Verification',
      description: `${stats?.mentors.pending || 0} pending verifications`,
      icon: UserCheck,
      color: 'green',
      route: '/admin/mentor-verification',
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: TrendingUp,
      color: 'purple',
      route: '/admin/analytics',
    },
    {
      title: 'Activity Monitor',
      description: 'Recent platform activity',
      icon: Activity,
      color: 'orange',
      route: '/admin/activity',
    },
  ];

  const engagementStats = [
    {
      label: 'Total Connections',
      value: stats?.engagement.totalConnections || 0,
      icon: Link,
      color: 'blue',
    },
    {
      label: 'Total Messages',
      value: stats?.engagement.totalMessages || 0,
      icon: MessageSquare,
      color: 'green',
    },
    {
      label: 'Total Reviews',
      value: stats?.engagement.totalReviews || 0,
      icon: Star,
      color: 'yellow',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Platform overview and analytics
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Last Updated */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: {lastUpdated.toLocaleString()}
      </p>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              {stat.trend === 'up' && (
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              )}
              {stat.trend === 'down' && (
                <ArrowDownRight className="h-5 w-5 text-red-500" />
              )}
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {stat.title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {stat.value}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stat.subtext}
              </span>
              <span
                className={`text-sm font-medium ${
                  stat.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : stat.trend === 'down'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Platform Engagement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {engagementStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.route)}
              className="flex items-start gap-3 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left group"
            >
              <div
                className={`p-2 rounded-lg ${getColorClasses(
                  action.color
                )} group-hover:scale-110 transition-transform`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* System Health (Optional - can add more details) */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-gray-900 dark:text-white font-medium">
            All systems operational
          </p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Platform is running smoothly with {stats?.sessions.completionRate || '0%'} session completion rate
        </p>
      </div>

      {/* Screenshot Manager */}
      <ScreenshotManager />
    </div>
  );
};

export default AdminDashboard;
