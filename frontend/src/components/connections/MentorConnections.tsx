import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  MessageCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  Mail,
  Clock,
  AlertCircle,
  Star,
} from 'lucide-react';
import axios from 'axios';

interface Connection {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message: string | null;
  createdAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

export const MentorConnections: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'decline'>('accept');
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [declineReason, setDeclineReason] = useState('');
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

  const handleAcceptConnection = async () => {
    if (!selectedConnection) return;

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

      await axios.post(
        `${import.meta.env.VITE_API_URL}/mentorship/connections/${selectedConnection.id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setConnections(prev =>
        prev.map(c =>
          c.id === selectedConnection.id
            ? { ...c, status: 'ACCEPTED' as const, acceptedAt: new Date().toISOString() }
            : c
        )
      );

      setActionModalOpen(false);
      setSelectedConnection(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept connection');
      console.error('Error accepting connection:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineConnection = async () => {
    if (!selectedConnection) return;

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

      await axios.post(
        `${import.meta.env.VITE_API_URL}/mentorship/connections/${selectedConnection.id}/decline`,
        { reason: declineReason || undefined },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setConnections(prev =>
        prev.map(c =>
          c.id === selectedConnection.id
            ? { ...c, status: 'REJECTED' as const, rejectedAt: new Date().toISOString() }
            : c
        )
      );

      setActionModalOpen(false);
      setSelectedConnection(null);
      setDeclineReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to decline connection');
      console.error('Error declining connection:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (connection: Connection, type: 'accept' | 'decline') => {
    setSelectedConnection(connection);
    setActionType(type);
    setActionModalOpen(true);
  };

  const filteredConnections = connections.filter(
    conn => conn.status === selectedTab.toUpperCase()
  );

  const getStatusCounts = () => {
    return {
      pending: connections.filter(c => c.status === 'PENDING').length,
      accepted: connections.filter(c => c.status === 'ACCEPTED').length,
      rejected: connections.filter(c => c.status === 'REJECTED').length,
    };
  };

  const counts = getStatusCounts();

  if (loading) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
              <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
              <Button onClick={fetchConnections}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Mentor Connections
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage connection requests and communicate with your mentees
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 mr-3 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {counts.pending}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {counts.accepted}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {3 - counts.accepted}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Available Slots</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Warning */}
      {counts.accepted >= 3 && (
        <div className="p-4 mb-6 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Maximum Capacity Reached
              </p>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                You have reached the maximum of 3 active mentees. You won't be able to accept new
                connections until a slot becomes available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'pending'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Pending Requests
            {counts.pending > 0 && (
              <span className="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 px-2 py-0.5 rounded-full text-xs">
                {counts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('accepted')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              selectedTab === 'accepted'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Active Mentees
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
            <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-0.5 rounded-full text-xs">
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
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                {selectedTab === 'pending' && 'No pending requests'}
                {selectedTab === 'accepted' && 'No active mentees'}
                {selectedTab === 'rejected' && 'No declined requests'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedTab === 'pending' && 'New connection requests will appear here'}
                {selectedTab === 'accepted' && 'Your active mentee connections will appear here'}
                {selectedTab === 'rejected' && 'Declined connection requests will appear here'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConnections.map((connection) => (
            <Card key={connection.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-3 space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 text-lg font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                    {connection.student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{connection.student.name}</CardTitle>
                    <CardDescription className="flex items-center text-xs">
                      <Mail className="w-3 h-3 mr-1" />
                      {connection.student.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Student Message */}
                  {connection.message ? (
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        Student's message:
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {connection.message}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm italic text-gray-500 dark:text-gray-400">
                        No message provided
                      </p>
                    </div>
                  )}

                  {/* Date Info */}
                  <div className="flex items-center pt-2 space-x-2 text-xs text-gray-500 border-t">
                    <Clock className="w-3 h-3" />
                    <span>
                      {selectedTab === 'pending' &&
                        `Requested ${new Date(connection.createdAt).toLocaleDateString()}`}
                      {selectedTab === 'accepted' &&
                        connection.acceptedAt &&
                        `Connected ${new Date(connection.acceptedAt).toLocaleDateString()}`}
                      {selectedTab === 'rejected' &&
                        connection.rejectedAt &&
                        `Declined ${new Date(connection.rejectedAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    {selectedTab === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => openActionModal(connection, 'accept')}
                          disabled={counts.accepted >= 3}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => openActionModal(connection, 'decline')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}
                    {selectedTab === 'accepted' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={() => (window.location.href = `/chat/${connection.id}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            (window.location.href = `/sessions?student=${connection.student.id}`)
                          }
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Sessions
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => {
          setActionModalOpen(false);
          setSelectedConnection(null);
          setDeclineReason('');
        }}
        title={
          actionType === 'accept' ? 'Accept Connection Request' : 'Decline Connection Request'
        }
      >
        <div className="space-y-4">
          {actionType === 'accept' ? (
            <>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to accept the connection request from{' '}
                <strong>{selectedConnection?.student.name}</strong>?
              </p>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <CheckCircle2 className="inline w-4 h-4 mr-2" />
                  A chat room will be created automatically, and the student will be notified via
                  email.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setActionModalOpen(false);
                    setSelectedConnection(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleAcceptConnection}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    'Accept Connection'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-400">
                Decline the connection request from{' '}
                <strong>{selectedConnection?.student.name}</strong>?
              </p>
              <div>
                <label
                  htmlFor="decline-reason"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reason (Optional - will be sent to the student)
                </label>
                <textarea
                  id="decline-reason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="E.g., 'Currently at full capacity' or 'Your profile doesn't match my expertise areas'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setActionModalOpen(false);
                    setSelectedConnection(null);
                    setDeclineReason('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleDeclineConnection}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Declining...
                    </>
                  ) : (
                    'Decline Request'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
