import React, { useState, useEffect } from 'react';
import { Calendar, Video, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import axios from 'axios';
import { format, isPast, isFuture } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface MentorSession {
  id: string;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingLink: string | null;
  title: string;
  description: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface SessionsData {
  all: MentorSession[];
  categorized: {
    upcoming: MentorSession[];
    past: MentorSession[];
    cancelled: MentorSession[];
  };
  isMentor: boolean;
}

type TabType = 'upcoming' | 'past' | 'cancelled';

export const MentorSessions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [sessions, setSessions] = useState<SessionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      const response = await axios.get(`${API_URL}/sessions/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSessions(response.data.data);
      }
    } catch (err: any) {
      console.error('Fetch sessions error:', err);
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (session: MentorSession) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
      
      // Mark session as started
      try {
        setActionLoading(session.id);
        const authStorage = localStorage.getItem('auth-storage');
        const token = authStorage ? JSON.parse(authStorage).state.token : null;

        await axios.put(
          `${API_URL}/sessions/${session.id}/start`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        fetchSessions();
      } catch (err) {
        console.error('Start session error:', err);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      setActionLoading(sessionId);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      await axios.put(
        `${API_URL}/sessions/${sessionId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const reason = prompt('Please provide a cancellation reason (optional):');
    
    try {
      setActionLoading(sessionId);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      await axios.put(
        `${API_URL}/sessions/${sessionId}/cancel`,
        { cancellationReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel session');
    } finally {
      setActionLoading(null);
    }
  };

  const getSessionStatus = (session: MentorSession) => {
    const scheduledTime = new Date(session.scheduledAt);

    if (session.status === 'CANCELLED') {
      return { text: 'Cancelled', color: 'text-red-600 dark:text-red-400', icon: XCircle };
    }
    if (session.status === 'COMPLETED') {
      return { text: 'Completed', color: 'text-green-600 dark:text-green-400', icon: CheckCircle };
    }
    if (session.status === 'NO_SHOW') {
      return { text: 'No Show', color: 'text-orange-600 dark:text-orange-400', icon: AlertCircle };
    }
    if (isPast(scheduledTime)) {
      return { text: 'Missed', color: 'text-gray-600 dark:text-gray-400', icon: AlertCircle };
    }
    if (isFuture(scheduledTime)) {
      return { text: 'Upcoming', color: 'text-blue-600 dark:text-blue-400', icon: Calendar };
    }
    return { text: 'Scheduled', color: 'text-blue-600 dark:text-blue-400', icon: Calendar };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  const currentSessions = sessions?.categorized[activeTab] || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Session Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your mentorship sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Upcoming ({sessions?.categorized.upcoming.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'past'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Past ({sessions?.categorized.past.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-4 px-2 font-medium transition-colors ${
            activeTab === 'cancelled'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Cancelled ({sessions?.categorized.cancelled.length || 0})
        </button>
      </div>

      {/* Sessions List */}
      {currentSessions.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No {activeTab} Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your {activeTab} mentorship sessions will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentSessions.map((session) => {
            const status = getSessionStatus(session);
            const StatusIcon = status.icon;
            const scheduledTime = new Date(session.scheduledAt);

            return (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 mb-4">
                        {session.student?.avatar ? (
                          <img
                            src={session.student.avatar}
                            alt={session.student?.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                            {session.student?.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {session.student?.name || 'Student'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session.student?.email}
                          </p>
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(scheduledTime, 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {format(scheduledTime, 'hh:mm a')} ({session.duration} min)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-sm font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>

                      {session.title && (
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {session.title}
                        </p>
                      )}
                      {session.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {session.status === 'SCHEDULED' && isFuture(scheduledTime) && (
                        <>
                          <Button
                            onClick={() => handleJoinSession(session)}
                            disabled={actionLoading === session.id}
                            size="sm"
                            variant="primary"
                            className="whitespace-nowrap"
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Session
                          </Button>
                          <Button
                            onClick={() => handleCompleteSession(session.id)}
                            disabled={actionLoading === session.id}
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                          <Button
                            onClick={() => handleCancelSession(session.id)}
                            disabled={actionLoading === session.id}
                            size="sm"
                            variant="outline"
                            className="whitespace-nowrap text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {session.status === 'SCHEDULED' && isPast(scheduledTime) && (
                        <Button
                          onClick={() => handleCompleteSession(session.id)}
                          disabled={actionLoading === session.id}
                          size="sm"
                          variant="primary"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
