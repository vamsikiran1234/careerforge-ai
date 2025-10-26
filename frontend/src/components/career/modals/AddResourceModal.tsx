import { useState } from 'react';
import { X, BookOpen, AlertCircle, ExternalLink, DollarSign, Clock } from 'lucide-react';
import { useCareerStore } from '../../../store/career';
import type { CreateResourceInput } from '../../../store/career';

interface AddResourceModalProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddResourceModal({ goalId, isOpen, onClose }: AddResourceModalProps) {
  const { createResource, isLoading } = useCareerStore();
  const [formData, setFormData] = useState<CreateResourceInput>({
    title: '',
    type: 'COURSE',
    url: '',
    platform: '',
    duration: '',
    cost: undefined,
    difficulty: 'INTERMEDIATE',
    rating: undefined,
    skillGapId: undefined,
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Resource title is required');
      return;
    }
    if (formData.url && !isValidUrl(formData.url)) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      await createResource(goalId, formData);
      
      // Reset form
      setFormData({
        title: '',
        type: 'COURSE',
        url: '',
        platform: '',
        duration: '',
        cost: undefined,
        difficulty: 'INTERMEDIATE',
        rating: undefined,
        skillGapId: undefined,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create resource');
    }
  };

  const handleChange = (field: keyof CreateResourceInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Learning Resource
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a course, book, or other learning material
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Resource Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., React - The Complete Guide 2024"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Type & Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resource Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resource Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="COURSE">📚 Course</option>
                <option value="VIDEO">🎥 Video</option>
                <option value="BOOK">📖 Book</option>
                <option value="ARTICLE">📄 Article</option>
                <option value="CERTIFICATION">🎓 Certification</option>
                <option value="PROJECT">💻 Project</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ExternalLink className="w-4 h-4" />
              Resource URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com/course"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platform / Provider
            </label>
            <input
              type="text"
              value={formData.platform}
              onChange={(e) => handleChange('platform', e.target.value)}
              placeholder="e.g., Udemy, Coursera, YouTube, Amazon"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Duration & Cost Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4" />
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 4 weeks, 20 hours"
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4" />
                Cost (USD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.cost === undefined ? '' : formData.cost}
                  onChange={(e) => handleChange('cost', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0 for free"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 pl-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter 0 if the resource is free
              </p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating (Optional)
            </label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleChange('rating', star)}
                  className="group"
                >
                  <svg
                    className={`w-8 h-8 transition-colors ${
                      formData.rating && star <= formData.rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-gray-600 group-hover:text-amber-300'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
              ))}
              {formData.rating && (
                <button
                  type="button"
                  onClick={() => handleChange('rating', undefined)}
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
