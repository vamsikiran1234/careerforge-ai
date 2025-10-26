import { useState, useEffect } from 'react';
import { X, Flag, Calendar as CalendarIcon } from 'lucide-react';
import { useCareerStore } from '../../../store/career';
import type { Milestone } from '../../../store/career';
import { format } from 'date-fns';

interface EditMilestoneModalProps {
  goalId: string;
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
}

type MilestoneCategory = 'SKILL_DEVELOPMENT' | 'NETWORKING' | 'PROJECT' | 'CERTIFICATION' | 'JOB_SEARCH';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export default function EditMilestoneModal({ goalId, milestone, isOpen, onClose }: EditMilestoneModalProps) {
  const { updateMilestone, isLoading } = useCareerStore();
  
  const [formData, setFormData] = useState({
    title: milestone.title,
    description: milestone.description || '',
    category: milestone.category as MilestoneCategory,
    targetDate: milestone.targetDate ? format(new Date(milestone.targetDate), 'yyyy-MM-dd') : '',
    priority: milestone.priority as Priority,
    estimatedHours: milestone.estimatedHours || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: milestone.title,
        description: milestone.description || '',
        category: milestone.category as MilestoneCategory,
        targetDate: milestone.targetDate ? format(new Date(milestone.targetDate), 'yyyy-MM-dd') : '',
        priority: milestone.priority as Priority,
        estimatedHours: milestone.estimatedHours || 0,
      });
      setErrors({});
    }
  }, [isOpen, milestone]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateMilestone(goalId, milestone.id, {
        ...formData,
        targetDate: new Date(formData.targetDate).toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to update milestone:', error);
      setErrors({ submit: 'Failed to update milestone. Please try again.' });
    }
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
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Flag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Milestone
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Update milestone details
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Milestone Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  errors.title 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Complete React certification"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="Describe what you need to achieve..."
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as MilestoneCategory })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="SKILL_DEVELOPMENT">💻 Skill Development</option>
                  <option value="NETWORKING">🤝 Networking</option>
                  <option value="PROJECT">🚀 Project</option>
                  <option value="CERTIFICATION">🏆 Certification</option>
                  <option value="JOB_SEARCH">🔍 Job Search</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="HIGH">🔴 High</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="LOW">🟢 Low</option>
                </select>
              </div>
            </div>

            {/* Target Date & Estimated Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      errors.targetDate 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.targetDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.targetDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., 40"
                />
              </div>
            </div>

            {/* Time Estimation Display */}
            {formData.estimatedHours > 0 && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  💡 <strong>{formData.estimatedHours} hours</strong> is approximately:
                  <span className="ml-2 font-semibold">
                    {Math.floor(formData.estimatedHours / 8)} days
                  </span>
                  {formData.estimatedHours >= 40 && (
                    <span className="ml-2">
                      or <strong>{Math.floor(formData.estimatedHours / 40)} weeks</strong>
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Updating...' : 'Update Milestone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
