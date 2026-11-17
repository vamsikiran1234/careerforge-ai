import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, Clock, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface CancelSessionModalProps {
  isOpen: boolean;
  session: {
    id: string;
    scheduledAt: string;
    duration: number;
    title?: string;
    mentor?: {
      user?: {
        name?: string;
      };
    };
    student?: {
      name?: string;
    };
  } | null;
  onClose: () => void;
  onConfirm: (sessionId: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const CancelSessionModal: React.FC<CancelSessionModalProps> = ({
  isOpen,
  session,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !session) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleCancelClick = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleConfirmClick = async () => {
    await onConfirm(session.id, reason.trim());
  };

  const scheduledDate = new Date(session.scheduledAt);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-session-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="cancel-session-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Cancel Mentorship Session
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Please confirm if you wish to cancel this booking
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelClick}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Session Overview Card */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700/80 space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {session.title || '1-on-1 Mentorship Session'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 pt-1">
              {session.mentor?.user?.name && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Mentor: {session.mentor.user.name}</span>
                </div>
              )}
              {session.student?.name && (
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">Student: {session.student.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{format(scheduledDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{format(scheduledDate, 'p')} ({session.duration} min)</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p>
              Are you sure you want to cancel this session? Once cancelled, the scheduled time slot will be released and both parties will be notified.
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="cancellation-reason"
              className="block text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              Cancellation Reason (Optional)
            </label>
            <textarea
              id="cancellation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Scheduling conflict, unexpected emergency, topic already resolved..."
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors resize-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancelClick}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400/20 transition-colors disabled:opacity-50"
          >
            Keep Session
          </button>
          
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
