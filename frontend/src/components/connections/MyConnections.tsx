import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  MessageCircle,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Briefcase,
  GraduationCap,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';

interface Connection {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string | null;
  createdAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  mentor: {
    id: string;
    company: string;
    jobTitle: string;
    yearsOfExperience: number;
    expertiseAreas: string[];
    averageRating: number | null;
    totalSessions: number;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  };
}

export const MyConnections: React.FC = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    setError('');
    try {
      // Get token from auth-storage
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/mentorship/connections`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setConnections(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch connections');
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async () => {
    if (!connectionToDelete) return;

    setActionLoading(true);
    try {
      let token = localStorage.getItem('token');
      if (!token) {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }
      }

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/mentorship/connections/${connectionToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove from local state
      setConnections(prev => prev.filter(c => c.id !== connectionToDelete.id));
      setDeleteModalOpen(false);
      setConnectionToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete connection');
      console.error('Error deleting connection:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (connection: Connection) => {
    setConnectionToDelete(connection);
    setDeleteModalOpen(true);
  };

  const filteredConnections = connections.filter(conn => {
    if (selectedTab === 'all') return true;
    return conn.status === selectedTab.toUpperCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>;
      case 'ACCEPTED':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Declined
        </Badge>;
      default:
        return null;
    }
  };

  const getStatusCounts = () => {
    return {
      all: connections.length,
      pending: connections.filter(c => c.status === 'PENDING').length,
      accepted: connections.filter(c => c.status === 'ACCEPTED').length,
      rejected: connections.filter(c => c.status === 'REJECTED').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Button onClick={fetchConnections}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Connections
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your mentorship connections and chat with mentors
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('all')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'all'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All Connections
            <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
              {counts.all}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'pending'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Pending
            <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-2 py-0.5 rounded-full text-xs">
              {counts.pending}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('accepted')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'accepted'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Active
            <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 px-2 py-0.5 rounded-full text-xs">
              {counts.accepted}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('rejected')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'rejected'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Declined
            <span className="ml-2 bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 px-2 py-0.5 rounded-full text-xs">
              {counts.rejected}
            </span>
          </button>
        </nav>
      </div>

      {/* Empty State */}
      {filteredConnections.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {selectedTab === 'all' && 'No connections yet'}
                {selectedTab === 'pending' && 'No pending requests'}
                {selectedTab === 'accepted' && 'No active connections'}
                {selectedTab === 'rejected' && 'No declined connections'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {selectedTab === 'all' && 'Start by finding mentors who can guide your career'}
                {selectedTab === 'pending' && 'Your connection requests will appear here'}
                {selectedTab === 'accepted' && 'Accepted connections will appear here'}
                {selectedTab === 'rejected' && 'Declined connections will appear here'}
              </p>
              {selectedTab === 'all' && (
                <Button onClick={() => navigate('/mentors')}>
                  Browse Mentors
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {connection.mentor.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {connection.mentor.user.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {connection.mentor.jobTitle}
                      </CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(connection.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Company */}
                  <div className="flex items-center space-x-2 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {connection.mentor.company}
                    </span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center space-x-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {connection.mentor.yearsOfExperience} years experience
                    </span>
                  </div>

                  {/* Rating */}
                  {connection.mentor.averageRating && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {connection.mentor.averageRating.toFixed(1)} ({connection.mentor.totalSessions} sessions)
                      </span>
                    </div>
                  )}

                  {/* Expertise */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(() => {
                      // Handle both array and JSON string for expertiseAreas
                      const areas = Array.isArray(connection.mentor.expertiseAreas)
                        ? connection.mentor.expertiseAreas
                        : typeof connection.mentor.expertiseAreas === 'string'
                        ? JSON.parse(connection.mentor.expertiseAreas)
                        : [];
                      
                      return areas.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ));
                    })()}
                    {(() => {
                      const areas = Array.isArray(connection.mentor.expertiseAreas)
                        ? connection.mentor.expertiseAreas
                        : typeof connection.mentor.expertiseAreas === 'string'
                        ? JSON.parse(connection.mentor.expertiseAreas)
                        : [];
                      
                      return areas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{areas.length - 3}
                        </Badge>
                      );
                    })()}
                  </div>

                  {/* Request Message */}
                  {connection.message && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Your message:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {connection.message}
                      </p>
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2 border-t">
                    <Clock className="w-3 h-3" />
                    <span>
                      {connection.status === 'PENDING' && `Requested ${new Date(connection.createdAt).toLocaleDateString()}`}
                      {connection.status === 'ACCEPTED' && connection.acceptedAt && `Connected ${new Date(connection.acceptedAt).toLocaleDateString()}`}
                      {connection.status === 'REJECTED' && connection.rejectedAt && `Declined ${new Date(connection.rejectedAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    {connection.status === 'ACCEPTED' ? (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/messages/${connection.id}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/sessions/book/${connection.mentor.id}`)}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Session
                        </Button>
                      </>
                    ) : connection.status === 'PENDING' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Awaiting Response
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate('/mentors')}
                      >
                        Browse Other Mentors
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteModal(connection)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setConnectionToDelete(null);
        }}
        title="Delete Connection"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this connection with{' '}
            <strong>{connectionToDelete?.mentor.user.name}</strong>?
          </p>
          {connectionToDelete?.status === 'ACCEPTED' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                This will also delete all chat history and scheduled sessions with this mentor.
              </p>
            </div>
          )}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteModalOpen(false);
                setConnectionToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDeleteConnection}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Connection'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
