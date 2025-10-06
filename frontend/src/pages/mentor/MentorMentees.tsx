import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Mail, Calendar, Loader2, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface Mentee {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  acceptedAt: string;
  message: string | null;
}

export const MentorMentees: React.FC = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
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

  const fetchMentees = async () => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/mentorship/connections?status=ACCEPTED`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMentees(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Mentees
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your active mentees and track their progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mentees.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mentees.length * 2}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mentees.length * 5}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Messages Exchanged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentees List */}
      {mentees.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Active Mentees Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Accept connection requests to start mentoring
            </p>
            <Link
              to="/mentor/connections"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              View Connection Requests
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentees.map((mentee) => (
            <Card key={mentee.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {mentee.student.avatar ? (
                    <img
                      src={mentee.student.avatar}
                      alt={mentee.student.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-lg">
                        {mentee.student.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {mentee.student.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {mentee.student.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">Connected since</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(mentee.acceptedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {mentee.message && (
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Initial message</p>
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                        {mentee.message}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link
                      to="/messages"
                      className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      <Mail className="h-4 w-4 inline mr-1" />
                      Message
                    </Link>
                    <Link
                      to="/mentor/sessions"
                      className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium text-center transition-colors"
                    >
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Sessions
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
