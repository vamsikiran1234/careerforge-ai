import { useState } from 'react';
import { X, Target, AlertCircle, TrendingUp } from 'lucide-react';
import { useCareerStore } from '../../../store/career';
import type { CreateSkillGapInput } from '../../../store/career';

interface AddSkillModalProps {
  goalId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSkillModal({ goalId, isOpen, onClose }: AddSkillModalProps) {
  const { createSkillGap, isLoading } = useCareerStore();
  const [formData, setFormData] = useState<CreateSkillGapInput>({
    skillName: '',
    category: 'TECHNICAL',
    currentLevel: 0,
    targetLevel: 8,
    priority: 'MEDIUM',
    estimatedWeeks: undefined,
  });
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.skillName.trim()) {
      setError('Skill name is required');
      return;
    }
    if (formData.currentLevel === undefined || formData.currentLevel < 0 || formData.currentLevel > 10) {
      setError('Current level must be between 0 and 10');
      return;
    }
    if (formData.targetLevel < 1 || formData.targetLevel > 10) {
      setError('Target level must be between 1 and 10');
      return;
    }
    if (formData.currentLevel >= formData.targetLevel) {
      setError('Target level must be higher than current level');
      return;
    }

    try {
      await createSkillGap(goalId, formData);
      
      // Reset form
      setFormData({
        skillName: '',
        category: 'TECHNICAL',
        currentLevel: 0,
        targetLevel: 8,
        priority: 'MEDIUM',
        estimatedWeeks: undefined,
      });
      
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create skill gap');
    }
  };

  const handleChange = (field: keyof CreateSkillGapInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  if (!isOpen) return null;

  const gap = formData.targetLevel - (formData.currentLevel || 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Add Skill Gap
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Identify a skill you need to develop
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

          {/* Skill Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.skillName}
              onChange={(e) => handleChange('skillName', e.target.value)}
              placeholder="e.g., React, System Design, Public Speaking"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT_SKILL">Soft Skill</option>
                <option value="DOMAIN_KNOWLEDGE">Domain Knowledge</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Skill Levels */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4" />
              Skill Level Assessment (0-10 scale)
            </h3>

            {/* Current Level */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Level
                </label>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formData.currentLevel}/10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.currentLevel}
                onChange={(e) => handleChange('currentLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0 - None</span>
                <span>5 - Intermediate</span>
                <span>10 - Expert</span>
              </div>
            </div>

            {/* Target Level */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target Level <span className="text-red-500">*</span>
                </label>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formData.targetLevel}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.targetLevel}
                onChange={(e) => handleChange('targetLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>1 - Basic</span>
                <span>5 - Proficient</span>
                <span>10 - Master</span>
              </div>
            </div>

            {/* Gap Indicator */}
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-800">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Skill Gap to Close
              </span>
              <span className={`text-2xl font-bold ${
                gap >= 5 
                  ? 'text-red-600 dark:text-red-400' 
                  : gap >= 3 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {gap} {gap === 1 ? 'level' : 'levels'}
              </span>
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Time to Learn (weeks)
            </label>
            <input
              type="number"
              value={formData.estimatedWeeks || ''}
              onChange={(e) => handleChange('estimatedWeeks', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 12"
              min="1"
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Estimate how long it will take to reach your target level
            </p>
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Adding...' : 'Add Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
