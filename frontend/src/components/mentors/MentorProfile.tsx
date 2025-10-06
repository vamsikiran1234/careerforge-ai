import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ReviewList from '@/components/reviews/ReviewList';
import type { MentorProfile as MentorProfileType } from '@/store/mentors';
import axios from 'axios';
import {
  Briefcase,
  GraduationCap,
  Star,
  MapPin,
  Clock,
  Calendar,
  Link as LinkIcon,
  CheckCircle,
  Users,
  MessageSquare,
  Video,
  X,
  Loader2,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface MentorProfileProps {
  mentor: MentorProfileType;
  isOpen: boolean;
  onClose: () => void;
  onRequestConnection: () => void;
  onBookSession: (mentorId: string) => void;
}

interface ConnectionStatus {
  hasConnection: boolean;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null;
  connectionId: string | null;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
  mentor,
  isOpen,
  onClose,
  onRequestConnection,
  onBookSession,
}) => {
  const isAvailable = mentor.activeConnections < 3;
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    hasConnection: false,
    status: null,
    connectionId: null,
  });
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    if (isOpen && mentor.id) {
      checkConnectionStatus();
    }
  }, [isOpen, mentor.id]);

  const checkConnectionStatus = async () => {
    setCheckingConnection(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      const response = await axios.get(
        `${API_URL}/mentorship/connections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const connections = response.data.data;
        const existingConnection = connections.find(
          (conn: any) => conn.mentor.id === mentor.id
        );

        if (existingConnection) {
          setConnectionStatus({
            hasConnection: true,
            status: existingConnection.status,
            connectionId: existingConnection.id,
          });
        } else {
          setConnectionStatus({
            hasConnection: false,
            status: null,
            connectionId: null,
          });
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    } finally {
      setCheckingConnection(false);
    }
  };

  const getActionButton = () => {
    if (checkingConnection) {
      return (
        <Button variant="primary" disabled className="flex-1">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Checking...
        </Button>
      );
    }

    if (!isAvailable) {
      return (
        <Button variant="primary" disabled className="flex-1">
          <Calendar className="w-5 h-5 mr-2" />
          Fully Booked
        </Button>
      );
    }

    // No connection - show request button
    if (!connectionStatus.hasConnection) {
      return (
        <Button
          variant="primary"
          onClick={onRequestConnection}
          className="flex-1"
        >
          <Users className="w-5 h-5 mr-2" />
          Request Connection
        </Button>
      );
    }

    // Connection exists - check status
    switch (connectionStatus.status) {
      case 'PENDING':
        return (
          <Button variant="secondary" disabled className="flex-1">
            <Clock className="w-5 h-5 mr-2" />
            Connection Pending
          </Button>
        );
      case 'ACCEPTED':
        return (
          <Button
            variant="primary"
            onClick={() => onBookSession(mentor.id)}
            className="flex-1"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Session
          </Button>
        );
      case 'REJECTED':
        return (
          <Button variant="danger" disabled className="flex-1">
            <X className="w-5 h-5 mr-2" />
            Request Declined
          </Button>
        );
      default:
        return (
          <Button
            variant="primary"
            onClick={onRequestConnection}
            className="flex-1"
          >
            <Users className="w-5 h-5 mr-2" />
            Request Connection
          </Button>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-4 flex-1">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {mentor.user.avatar ? (
                <img
                  src={mentor.user.avatar}
                  alt={mentor.user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {mentor.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mentor.user.name}
                </h2>
                {mentor.isVerified && (
                  <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                {mentor.jobTitle}
              </p>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Briefcase className="w-4 h-4 mr-2" />
                <span className="font-medium">{mentor.company}</span>
                <span className="mx-2">•</span>
                <span>{mentor.yearsOfExperience}+ years</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mentor.averageRating?.toFixed(1) || 'New'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mentor.totalSessions}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sessions</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {mentor.availableHoursPerWeek}h
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Per Week</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            About
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {mentor.bio}
          </p>
        </div>

        {/* Expertise */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Expertise Areas
          </h3>
          <div className="flex flex-wrap gap-2">
            {(() => {
              // Handle both array and JSON string for expertiseAreas
              const areas = Array.isArray(mentor.expertiseAreas)
                ? mentor.expertiseAreas
                : typeof mentor.expertiseAreas === 'string'
                ? JSON.parse(mentor.expertiseAreas)
                : [];
              
              return areas.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {skill}
                </Badge>
              ));
            })()}
          </div>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Education
          </h3>
          <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <GraduationCap className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {mentor.degree}
                {mentor.major && ` in ${mentor.major}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mentor.collegeName} • Class of {mentor.graduationYear}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Links */}
        {(mentor.linkedinUrl || mentor.portfolioUrl) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Links
            </h3>
            <div className="flex flex-wrap gap-3">
              {mentor.linkedinUrl && (
                <a
                  href={mentor.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  LinkedIn Profile
                </a>
              )}
              {mentor.portfolioUrl && (
                <a
                  href={mentor.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        )}

        {/* Availability Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Availability
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Timezone
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mentor.timezone}
                </p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              {mentor.preferredMeetingType === 'VIDEO' ? (
                <Video className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
              ) : (
                <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Preferred Format
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {mentor.preferredMeetingType === 'VIDEO'
                    ? 'Video Calls'
                    : mentor.preferredMeetingType === 'CHAT'
                    ? 'Text Chat'
                    : 'Both'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-6">
          <ReviewList mentorId={mentor.id} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {getActionButton()}
        </div>

        {/* Status Note */}
        {isAvailable && !checkingConnection && (
          <div className="mt-3">
            {connectionStatus.status === 'PENDING' && (
              <p className="text-center text-sm text-amber-600 dark:text-amber-400">
                Your connection request is awaiting mentor approval
              </p>
            )}
            {connectionStatus.status === 'ACCEPTED' && (
              <p className="text-center text-sm text-green-600 dark:text-green-400">
                You're connected! Ready to book a session
              </p>
            )}
            {!connectionStatus.hasConnection && (
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {3 - mentor.activeConnections} spot{3 - mentor.activeConnections !== 1 ? 's' : ''}{' '}
                available
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
