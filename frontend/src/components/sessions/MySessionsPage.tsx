import { useState, useEffect } from 'react';
import { Calendar, Video, Clock, User, AlertCircle, CheckCircle, XCircle, ExternalLink, Star } from 'lucide-react';
import axios from 'axios';
import { format, formatDistanceToNow, isPast, isFuture, isWithinInterval, addMinutes } from 'date-fns';
import type { MentorSession } from '../../types';
import RatingModal from '../reviews/RatingModal';

const VITE_API_URL = import.meta.env.VITE_API_URL;

type TabType = 'upcoming' | 'past' | 'cancelled';

interface SessionsData {
  all: MentorSession[];
  categorized: {
    upcoming: MentorSession[];
    past: MentorSession[];
    cancelled: MentorSession[];
  };
  isMentor: boolean;
}

export default function MySessionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [sessions, setSessions] = useState<SessionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState<MentorSession | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      const response = await axios.get(`${VITE_API_URL}/sessions/my-sessions`, {
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
    try {
      setActionLoading(session.id);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      // Mark session as started
      await axios.put(
        `${VITE_API_URL}/sessions/${session.id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Open Jitsi meeting in new tab
      if (session.meetingLink) {
        window.open(session.meetingLink, '_blank');
      }

      // Refresh sessions
      fetchSessions();
    } catch (err: any) {
      console.error('Join session error:', err);
      alert(err.response?.data?.message || 'Failed to join session');
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
        `${VITE_API_URL}/sessions/${sessionId}/cancel`,
        { cancellationReason: reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Session cancelled successfully');
      fetchSessions();
    } catch (err: any) {
      console.error('Cancel session error:', err);
      alert(err.response?.data?.message || 'Failed to cancel session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    const notes = prompt('Add session notes (optional):');
    
    try {
      setActionLoading(sessionId);
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage).state.token : null;

      await axios.put(
        `${VITE_API_URL}/sessions/${sessionId}/complete`,
        { sessionNotes: notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Session marked as complete');
      fetchSessions();
    } catch (err: any) {
      console.error('Complete session error:', err);
      alert(err.response?.data?.message || 'Failed to mark session as complete');
    } finally {
      setActionLoading(null);
    }
  };

  const canJoinSession = (session: MentorSession) => {
    const scheduledTime = new Date(session.scheduledAt);
    const now = new Date();
    const fifteenMinsBefore = addMinutes(scheduledTime, -15);
    const sessionEnd = addMinutes(scheduledTime, session.duration);

    return (
      session.status === 'SCHEDULED' &&
      isWithinInterval(now, { start: fifteenMinsBefore, end: sessionEnd })
    );
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSessions = sessions?.categorized[activeTab] || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your mentorship sessions
            {sessions?.isMentor && ' (as mentor and student)'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {(['upcoming', 'past', 'cancelled'] as TabType[]).map((tab) => {
              const count = sessions?.categorized[tab]?.length || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sessions List */}
        {currentSessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab} sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'upcoming' 
                ? 'Book a session with a mentor to get started'
                : `You have no ${activeTab} sessions`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentSessions.map((session) => {
              const status = getSessionStatus(session);
              const StatusIcon = status.icon;
              const canJoin = canJoinSession(session);

              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {session.title}
                        </h3>
                      </div>

                      {session.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {session.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Mentor/Student Info */}
                        {session.mentor && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {sessions?.isMentor ? 'With' : 'Mentor'}
                              </p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {session.mentor.user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {session.mentor.jobTitle} at {session.mentor.company}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Date & Time */}
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {format(new Date(session.scheduledAt), 'PPP')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(session.scheduledAt), 'p')} • {session.duration} min
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDistanceToNow(new Date(session.scheduledAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Session Type */}
                      <div className="flex items-center space-x-2 mb-4">
                        <Video className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {session.sessionType} Session
                        </span>
                      </div>

                      {/* Agenda Notes */}
                      {session.agendaNotes && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                            Agenda:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-400">
                            {session.agendaNotes}
                          </p>
                        </div>
                      )}

                      {/* Session Notes (for completed) */}
                      {session.sessionNotes && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                            Session Notes:
                          </p>
                          <p className="text-sm text-green-800 dark:text-green-400">
                            {session.sessionNotes}
                          </p>
                        </div>
                      )}

                      {/* Cancellation Reason */}
                      {session.cancellationReason && (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                            Cancellation Reason:
                          </p>
                          <p className="text-sm text-red-800 dark:text-red-400">
                            {session.cancellationReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {/* Join Video Call Button */}
                      {canJoin && session.meetingLink && (
                        <button
                          onClick={() => handleJoinSession(session)}
                          disabled={actionLoading === session.id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Video Call
                        </button>
                      )}

                      {/* Cancel Button */}
                      {session.status === 'SCHEDULED' && !isPast(new Date(session.scheduledAt)) && (
                        <button
                          onClick={() => handleCancelSession(session.id)}
                          disabled={actionLoading === session.id}
                          className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      )}

                      {/* Complete Button (Mentor only) */}
                      {sessions?.isMentor && 
                       session.status === 'SCHEDULED' && 
                       isPast(new Date(session.scheduledAt)) && (
                        <button
                          onClick={() => handleCompleteSession(session.id)}
                          disabled={actionLoading === session.id}
                          className="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-700 text-sm font-medium rounded-md text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Complete
                        </button>
                      )}

                      {/* View Meeting Link */}
                      {session.meetingLink && session.status !== 'CANCELLED' && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Meeting Link
                        </a>
                      )}

                      {/* Rate Session Button (for completed sessions) */}
                      {session.status === 'COMPLETED' && !sessions?.isMentor && (
                        <button
                          onClick={() => {
                            setSelectedSessionForRating(session);
                            setRatingModalOpen(true);
                          }}
                          disabled={actionLoading === session.id}
                          className="inline-flex items-center px-4 py-2 border border-yellow-300 dark:border-yellow-700 text-sm font-medium rounded-md text-yellow-700 dark:text-yellow-400 bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Rate Session
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rating Modal */}
        {ratingModalOpen && selectedSessionForRating && selectedSessionForRating.mentor && (
          <RatingModal
            isOpen={ratingModalOpen}
            onClose={() => {
              setRatingModalOpen(false);
              setSelectedSessionForRating(null);
            }}
            mentorId={selectedSessionForRating.mentorId}
            mentorName={selectedSessionForRating.mentor.user.name}
            sessionId={selectedSessionForRating.id}
            onSuccess={() => {
              fetchSessions();
            }}
          />
        )}
      </div>
    </div>
  );
}
