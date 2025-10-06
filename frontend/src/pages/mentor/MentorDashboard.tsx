import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface DashboardStats {
  totalEarnings: number;
  activeMentees: number;
  upcomingSessions: number;
  averageRating: number;
  pendingRequests: number;
  completedSessions: number;
}

interface PendingRequest {
  id: string;
  student: {
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  message: string | null;
}

interface UpcomingSession {
  id: string;
  scheduledAt: string;
  duration: number;
  student: {
    name: string;
  };
  status: string;
}

export const MentorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    activeMentees: 0,
    upcomingSessions: 0,
    averageRating: 0,
    pendingRequests: 0,
    completedSessions: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchDashboardData = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch connections for stats
      const [pendingRes, acceptedRes, sessionsRes] = await Promise.all([
        axios.get(`${API_URL}/mentorship/connections?status=PENDING`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/mentorship/connections?status=ACCEPTED`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/mentorship/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pending = pendingRes.data.data || [];
      const accepted = acceptedRes.data.data || [];
      const allSessions = sessionsRes.data.data || [];

      // Calculate stats
      const upcoming = allSessions.filter((s: UpcomingSession) => 
        s.status === 'SCHEDULED' && new Date(s.scheduledAt) > new Date()
      );
      const completed = allSessions.filter((s: UpcomingSession) => s.status === 'COMPLETED');

      setStats({
        totalEarnings: completed.length * 50, // $50 per session (example)
        activeMentees: accepted.length,
        upcomingSessions: upcoming.length,
        averageRating: 4.8, // Mock data - implement real ratings later
        pendingRequests: pending.length,
        completedSessions: completed.length,
      });

      setPendingRequests(pending.slice(0, 3)); // Show top 3
      setUpcomingSessions(upcoming.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mentor Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your mentorship overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                  Total Earnings
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  ${stats.totalEarnings}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% this month
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Mentees */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                  Active Mentees
                </p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.activeMentees}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  Max capacity: 3
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                  Upcoming Sessions
                </p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.upcomingSessions}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                  Next: Today at 3 PM
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                  Average Rating
                </p>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.averageRating}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                  Based on {stats.completedSessions} sessions
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Connection Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                Pending Requests
              </span>
              <Link
                to="/mentor/connections"
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No pending requests
              </p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {request.student.avatar ? (
                        <img
                          src={request.student.avatar}
                          alt={request.student.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {request.student.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.student.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {request.message || 'Would like to connect with you'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Upcoming Sessions
              </span>
              <Link
                to="/mentor/sessions"
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No upcoming sessions
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Session with {session.student.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(session.scheduledAt).toLocaleString()} • {session.duration} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/mentor/connections"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Review Requests
              </span>
            </Link>
            <Link
              to="/mentor/availability"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <Clock className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Set Availability
              </span>
            </Link>
            <Link
              to="/mentor/sessions"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Manage Sessions
              </span>
            </Link>
            <Link
              to="/mentor/earnings"
              className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <DollarSign className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                View Earnings
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
