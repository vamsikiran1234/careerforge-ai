import { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { useCareerStore } from '../../../store/career';
import type { SkillGap } from '../../../store/career';

interface EditSkillModalProps {
  goalId: string;
  skill: SkillGap;
  isOpen: boolean;
  onClose: () => void;
}

type SkillCategory = 'TECHNICAL' | 'SOFT_SKILL' | 'DOMAIN_KNOWLEDGE';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export default function EditSkillModal({ goalId, skill, isOpen, onClose }: EditSkillModalProps) {
  const { updateSkillGap, isLoading } = useCareerStore();
  
  const [formData, setFormData] = useState({
    skillName: skill.skillName,
    category: skill.category as SkillCategory,
    currentLevel: skill.currentLevel,
    targetLevel: skill.targetLevel,
    priority: skill.priority as Priority,
    estimatedWeeks: skill.estimatedWeeks || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        skillName: skill.skillName,
        category: skill.category as SkillCategory,
        currentLevel: skill.currentLevel,
        targetLevel: skill.targetLevel,
        priority: skill.priority as Priority,
        estimatedWeeks: skill.estimatedWeeks || 0,
      });
      setErrors({});
    }
  }, [isOpen, skill]);

  const gap = formData.targetLevel - formData.currentLevel;

  const getGapColor = () => {
    if (gap >= 5) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    if (gap >= 3) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.skillName.trim()) {
      newErrors.skillName = 'Skill name is required';
    }

    if (formData.currentLevel > formData.targetLevel) {
      newErrors.levels = 'Current level cannot be higher than target level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateSkillGap(goalId, skill.id, {
        ...formData,
        gap: formData.targetLevel - formData.currentLevel,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update skill:', error);
      setErrors({ submit: 'Failed to update skill. Please try again.' });
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Edit Skill Gap
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Update skill details and progress
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
            {/* Skill Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                value={formData.skillName}
                onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.skillName 
                    ? 'border-red-300 dark:border-red-700' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="e.g., React, TypeScript, System Design"
              />
              {errors.skillName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.skillName}</p>
              )}
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SkillCategory })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TECHNICAL">💻 Technical</option>
                  <option value="SOFT_SKILL">🤝 Soft Skill</option>
                  <option value="DOMAIN_KNOWLEDGE">📚 Domain Knowledge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HIGH">🔴 High</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="LOW">🟢 Low</option>
                </select>
              </div>
            </div>

            {/* Current Level Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Level: <span className="text-blue-600 dark:text-blue-400 font-bold">{formData.currentLevel}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: parseFloat(e.target.value) })}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 dark:from-red-900 dark:via-amber-900 dark:to-emerald-900 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    rgb(254 202 202) 0%, 
                    rgb(253 230 138) 50%, 
                    rgb(167 243 208) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0 - No Knowledge</span>
                <span>5 - Intermediate</span>
                <span>10 - Expert</span>
              </div>
            </div>

            {/* Target Level Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Level: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formData.targetLevel}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={formData.targetLevel}
                onChange={(e) => setFormData({ ...formData, targetLevel: parseFloat(e.target.value) })}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-amber-200 to-emerald-200 dark:from-red-900 dark:via-amber-900 dark:to-emerald-900 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    rgb(254 202 202) 0%, 
                    rgb(253 230 138) 50%, 
                    rgb(167 243 208) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0 - No Knowledge</span>
                <span>5 - Intermediate</span>
                <span>10 - Expert</span>
              </div>
            </div>

            {/* Gap Display */}
            <div className={`p-4 rounded-lg ${getGapColor()}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Skill Gap:</span>
                <span className="text-2xl font-bold">{gap.toFixed(1)} levels</span>
              </div>
              {errors.levels && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.levels}</p>
              )}
            </div>

            {/* Estimated Weeks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Learning Time (weeks)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.estimatedWeeks}
                onChange={(e) => setFormData({ ...formData, estimatedWeeks: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Approximately {formData.estimatedWeeks} weeks ({(formData.estimatedWeeks * 7)} days)
              </p>
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
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? 'Updating...' : 'Update Skill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
