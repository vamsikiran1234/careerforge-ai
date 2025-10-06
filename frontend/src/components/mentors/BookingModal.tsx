import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { MentorProfile as MentorProfileType } from '@/store/mentors';
import axios from 'axios';
import { CheckCircle, X, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface BookingModalProps {
  mentor: MentorProfileType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_GOALS = [
  'Interview Preparation',
  'Resume Review',
  'Career Guidance',
  'Technical Skills',
  'System Design',
  'Leadership Advice',
  'Job Search Strategy',
  'Salary Negotiation',
];

export const BookingModal: React.FC<BookingModalProps> = ({
  mentor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [message, setMessage] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!message.trim()) {
      setError('Please write a message to the mentor');
      return;
    }

    if (selectedGoals.length === 0) {
      setError('Please select at least one mentorship goal');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_URL}/mentorship/connections/request`,
        {
          mentorId: mentor.id,
          message: message.trim(),
          goals: selectedGoals,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          resetForm();
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to send connection request');
      }
    } catch (err: any) {
      console.error('Error sending connection request:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send connection request'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSelectedGoals([]);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Request Sent!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your connection request has been sent to {mentor.user.name}. You'll be
            notified when they respond.
          </p>
          <Button onClick={handleClose} variant="primary">
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Request Connection
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Send a connection request to {mentor.user.name}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mentor Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            {mentor.user.avatar ? (
              <img
                src={mentor.user.avatar}
                alt={mentor.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                {mentor.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {mentor.user.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {mentor.jobTitle} at {mentor.company}
              </p>
            </div>
          </div>
        </div>

        {/* Mentorship Goals */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What are you looking for? *
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_GOALS.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <Badge
                  key={goal}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleGoalToggle(goal)}
                >
                  {goal}
                  {isSelected && <X className="w-3 h-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Select all that apply (max 3)
          </p>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Introduction Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${mentor.user.name},\n\nI'm a student interested in ${mentor.industry}. I'd love to learn from your experience at ${mentor.company}...\n\nI'm particularly interested in:\n- [Your specific interests]\n- [Career goals]\n\nLooking forward to connecting!`}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={8}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {message.length}/500 characters
            </p>
            {message.length > 450 && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {500 - message.length} characters remaining
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tips */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Tips for a great connection request:
          </p>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
            <li>Be specific about what you're looking for help with</li>
            <li>Mention why you chose this mentor specifically</li>
            <li>Share your current situation and goals</li>
            <li>Be respectful of their time</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
            disabled={loading || selectedGoals.length === 0 || !message.trim()}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Request'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
