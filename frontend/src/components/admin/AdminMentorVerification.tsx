import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Calendar,
  Mail,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import axios from 'axios';

interface PendingMentor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  company: string;
  jobTitle: string;
  industry: string;
  yearsOfExperience: number;
  collegeName: string;
  degree: string;
  graduationYear: number;
  major: string | null;
  expertiseAreas: string[];
  bio: string;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  availableHoursPerWeek: number;
  preferredMeetingType: string;
  timezone: string;
  createdAt: string;
}

export const AdminMentorVerification: React.FC = () => {
  const [pendingMentors, setPendingMentors] = useState<PendingMentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<PendingMentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingMentors();
  }, []);

  const fetchPendingMentors = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mentorship/admin/mentors/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setPendingMentors(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending mentors');
      console.error('Error fetching pending mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/mentorship/admin/mentors/${mentorId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Remove approved mentor from list
        setPendingMentors(prev => prev.filter(m => m.id !== mentorId));
        setShowDetailModal(false);
        setSelectedMentor(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve mentor');
      console.error('Error approving mentor:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMentor || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/mentorship/admin/mentors/${selectedMentor.id}/reject`,
        { reason: rejectionReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Remove rejected mentor from list
        setPendingMentors(prev => prev.filter(m => m.id !== selectedMentor.id));
        setShowDetailModal(false);
        setShowRejectModal(false);
        setSelectedMentor(null);
        setRejectionReason('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject mentor');
      console.error('Error rejecting mentor:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailModal = (mentor: PendingMentor) => {
    setSelectedMentor(mentor);
    setShowDetailModal(true);
  };

  const openRejectModal = () => {
    setShowDetailModal(false);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchPendingMentors}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pending Mentor Applications
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve mentor registrations
          </p>
        </div>
        <Badge variant="secondary" className="text-lg">
          <Clock className="w-4 h-4 mr-2" />
          {pendingMentors.length} Pending
        </Badge>
      </div>

      {/* Pending Mentors List */}
      {pendingMentors.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                All Caught Up!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No pending mentor applications at the moment
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingMentors.map(mentor => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {mentor.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{mentor.user.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {mentor.user.email}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Professional Info */}
                  <div className="flex items-start space-x-2 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {mentor.jobTitle}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">{mentor.company}</p>
                    </div>
                  </div>

                  {/* Education */}
                  <div className="flex items-start space-x-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {mentor.degree}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {mentor.collegeName}, {mentor.graduationYear}
                      </p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Award className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {mentor.yearsOfExperience} years experience
                    </span>
                  </div>

                  {/* Expertise */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(() => {
                      const areas = Array.isArray(mentor.expertiseAreas)
                        ? mentor.expertiseAreas
                        : typeof mentor.expertiseAreas === 'string'
                        ? JSON.parse(mentor.expertiseAreas)
                        : [];
                      
                      return areas.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ));
                    })()}
                    {(() => {
                      const areas = Array.isArray(mentor.expertiseAreas)
                        ? mentor.expertiseAreas
                        : typeof mentor.expertiseAreas === 'string'
                        ? JSON.parse(mentor.expertiseAreas)
                        : [];
                      
                      return areas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{areas.length - 3}
                        </Badge>
                      );
                    })()}
                  </div>

                  {/* Applied Date */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Applied {new Date(mentor.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDetailModal(mentor)}
                    >
                      Review
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(mentor.id)}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMentor && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMentor(null);
          }}
          title="Review Mentor Application"
          size="xl"
        >
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {selectedMentor.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedMentor.user.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {selectedMentor.user.email}
                </p>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Company:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.company}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Job Title:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.jobTitle}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Industry:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.industry}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.yearsOfExperience} years
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Educational Background
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">College:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.collegeName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Degree:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.degree}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Graduation Year:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.graduationYear}
                  </p>
                </div>
                {selectedMentor.major && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Major:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedMentor.major}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Expertise Areas */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Expertise Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const areas = Array.isArray(selectedMentor.expertiseAreas)
                    ? selectedMentor.expertiseAreas
                    : typeof selectedMentor.expertiseAreas === 'string'
                    ? JSON.parse(selectedMentor.expertiseAreas)
                    : [];
                  
                  return areas.map((skill: string) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ));
                })()}
              </div>
            </div>

            {/* Bio */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Bio
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {selectedMentor.bio}
              </p>
            </div>

            {/* Links */}
            {(selectedMentor.linkedinUrl || selectedMentor.portfolioUrl) && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Links
                </h4>
                <div className="space-y-2">
                  {selectedMentor.linkedinUrl && (
                    <a
                      href={selectedMentor.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 dark:text-primary-400 hover:underline text-sm"
                    >
                      LinkedIn Profile
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                  {selectedMentor.portfolioUrl && (
                    <a
                      href={selectedMentor.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary-600 dark:text-primary-400 hover:underline text-sm"
                    >
                      Portfolio
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Availability */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Availability
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Hours/Week:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.availableHoursPerWeek} hours
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Meeting Type:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedMentor.preferredMeetingType}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="danger"
                className="flex-1"
                onClick={openRejectModal}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => handleApprove(selectedMentor.id)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason('');
        }}
        title="Reject Mentor Application"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a reason for rejecting this application. This will be sent to the
            applicant via email.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            rows={4}
          />
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowRejectModal(false);
                setShowDetailModal(true);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
