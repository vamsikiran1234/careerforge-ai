import { useState } from 'react';
import { X, Circle, Clock, AlertTriangle } from 'lucide-react';

interface MarkIncompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED') => void;
  milestoneTitle: string;
}

type IncompleteStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED';

export default function MarkIncompleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  milestoneTitle 
}: MarkIncompleteModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<IncompleteStatus>('NOT_STARTED');

  const statusOptions = [
    {
      value: 'NOT_STARTED' as const,
      label: 'Not Started',
      description: 'Reset to beginning (0% progress)',
      icon: Circle,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700',
      borderColor: 'border-gray-300 dark:border-gray-600'
    },
    {
      value: 'IN_PROGRESS' as const,
      label: 'In Progress',
      description: 'Keep current progress, continue working',
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-300 dark:border-blue-700'
    },
    {
      value: 'BLOCKED' as const,
      label: 'Blocked',
      description: 'Needs attention or has obstacles',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-300 dark:border-red-700'
    }
  ];

  const handleConfirm = () => {
    onConfirm(selectedStatus);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mark as Incomplete
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose the new status for this milestone
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Milestone Title */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                Milestone: {milestoneTitle}
              </h3>
            </div>

            {/* Status Options */}
            <div className="space-y-3 mb-6">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedStatus === option.value;
                
                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? `${option.borderColor} ${option.bgColor}`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => setSelectedStatus(e.target.value as IncompleteStatus)}
                      className="sr-only"
                    />
                    <div className={`flex-shrink-0 p-2 rounded-lg ${isSelected ? option.bgColor : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Icon className={`w-5 h-5 ${isSelected ? option.color : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${isSelected ? option.color : 'text-gray-900 dark:text-white'}`}>
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className={`w-5 h-5 rounded-full border-2 ${option.borderColor} ${option.bgColor} flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')}`} />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                    This will revert the completion
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    The milestone will be marked as incomplete and the completion date will be cleared.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Mark Incomplete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}