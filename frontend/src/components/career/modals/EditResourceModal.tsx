import { useState, useEffect } from 'react';
import { X, BookOpen, Star } from 'lucide-react';
import { useCareerStore } from '../../../store/career';
import type { LearningResource } from '../../../store/career';

interface EditResourceModalProps {
  goalId: string;
  resource: LearningResource;
  isOpen: boolean;
  onClose: () => void;
}

type ResourceType = 'COURSE' | 'BOOK' | 'VIDEO' | 'ARTICLE' | 'CERTIFICATION' | 'PROJECT';

export default function EditResourceModal({ goalId, resource, isOpen, onClose }: EditResourceModalProps) {
  const { updateResource, isLoading } = useCareerStore();
  
  const [formData, setFormData] = useState({
    title: resource.title,
    type: resource.type as ResourceType,
    url: resource.url || '',
    platform: resource.platform || '',
    duration: resource.duration || '',
    cost: resource.cost?.toString() || '0',
    difficulty: resource.difficulty || 'BEGINNER',
    rating: resource.rating || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: resource.title,
        type: resource.type as ResourceType,
        url: resource.url || '',
        platform: resource.platform || '',
        duration: resource.duration || '',
        cost: resource.cost?.toString() || '0',
        difficulty: resource.difficulty || 'BEGINNER',
        rating: resource.rating || 0,
      });
      setErrors({});
    }
  }, [isOpen, resource]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.url && !formData.url.match(/^https?:\/\/.+/)) {
      newErrors.url = 'Please enter a valid URL (must start with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateResource(goalId, resource.id, {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : 0,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update resource:', error);
      setErrors({ submit: 'Failed to update resource. Please try again.' });
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Learning Resource
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Update resource details
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
                Resource Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.title 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., Complete React Course 2024"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>

            {/* Type & Platform */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="COURSE">📚 Course</option>
                  <option value="BOOK">📖 Book</option>
                  <option value="VIDEO">🎥 Video</option>
                  <option value="ARTICLE">📄 Article</option>
                  <option value="CERTIFICATION">🏆 Certification</option>
                  <option value="PROJECT">💻 Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform
                </label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Udemy, Coursera"
                />
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors ${
                  errors.url 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="https://example.com/course"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.url}</p>
              )}
            </div>

            {/* Duration, Cost, Difficulty */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 4 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredStar || formData.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 self-center">
                  {formData.rating > 0 ? `${formData.rating}/5` : 'Not rated'}
                </span>
              </div>
            </div>

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
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Updating...' : 'Update Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
