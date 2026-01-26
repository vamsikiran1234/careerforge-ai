import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ActivityLog {
  id: string;
  type: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export const AdminActivityMonitor: React.FC = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeUsers: 0,
    todayMessages: 0,
    todaySessions: 0,
    todaySignups: 0,
  });

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

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    const token = getToken();
    if (!token) return;

    try {
      // Fetch recent activities
      const activitiesResponse = await axios.get(
        `${API_URL}/admin/activities`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (activitiesResponse.data.success) {
        setActivities(activitiesResponse.data.data || []);
      }

      // Fetch activity stats
      const statsResponse = await axios.get(
        `${API_URL}/admin/activity-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Monitor</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Real-time platform activity and user engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.todayMessages}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.todaySessions}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">New Signups</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.todaySignups}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
          </h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{activity.user}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{activity.action}</span>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {activity.type}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
