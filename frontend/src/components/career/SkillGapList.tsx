import { useState } from 'react';
import type { SkillGap } from '../../store/career';
import { useCareerStore } from '../../store/career';
import { Target, Plus, TrendingUp, BookOpen, Edit, Trash2 } from 'lucide-react';
import AddSkillModal from './modals/AddSkillModal';
import EditSkillModal from './modals/EditSkillModal';

interface SkillGapListProps {
  goalId: string;
  skillGaps: SkillGap[];
  onFindResources?: (skillName: string) => void;
}

export default function SkillGapList({ goalId, skillGaps, onFindResources }: SkillGapListProps) {
  const { updateSkillProgress, isLoading } = useCareerStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillGap | null>(null);

  // Sort by priority and gap size
  const sortedSkills = [...skillGaps].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3;
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    return (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel);
  });

  const handleProgressUpdate = async (skillId: string, newLevel: number) => {
    await updateSkillProgress(goalId, skillId, newLevel);
  };

  const getGapSeverity = (gap: number) => {
    if (gap >= 5) return { label: 'Large Gap', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (gap >= 3) return { label: 'Medium Gap', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
    return { label: 'Small Gap', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' };
  };

  if (sortedSkills.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Skills Identified Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Identify the skills you need to develop to achieve your career goal.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>
        <AddSkillModal 
          goalId={goalId} 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Skills to Develop ({sortedSkills.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your progress across key skills
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSkills.map((skill) => {
          const gap = skill.targetLevel - skill.currentLevel;
          // const progress = (skill.currentLevel / skill.targetLevel) * 100;
          const severity = getGapSeverity(gap);
          const isExpanded = expandedId === skill.id;

          return (
            <div
              key={skill.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all ${
                isExpanded
                  ? 'border-emerald-300 dark:border-emerald-700 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Skill Header */}
              <div 
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : skill.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {skill.skillName}
                    </h4>
                    {skill.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {skill.category}
                      </span>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${severity.bg} ${severity.color}`}>
                    Gap: {gap}
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Current: {skill.currentLevel}/10</span>
                    <span>Target: {skill.targetLevel}/10</span>
                  </div>
                  
                  {/* Dual Progress Bar */}
                  <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    {/* Current Level */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${(skill.currentLevel / 10) * 100}%` }}
                    />
                    {/* Target Level Indicator */}
                    <div
                      className="absolute inset-y-0 left-0 border-2 border-emerald-500 rounded-full transition-all pointer-events-none"
                      style={{ width: `${(skill.targetLevel / 10) * 100}%` }}
                    />
                  </div>

                  {/* Level Numbers */}
                  <div className="flex justify-between text-xs text-gray-400">
                    {[0, 2, 4, 6, 8, 10].map(num => (
                      <span key={num}>{num}</span>
                    ))}
                  </div>
                </div>

                {/* Priority Badge */}
                {skill.priority && (
                  <div className="mt-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.priority === 'HIGH'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : skill.priority === 'MEDIUM'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {skill.priority} Priority
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/50">
                  {/* Learning Strategy */}
                  {skill.learningStrategy && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
                            Learning Strategy
                          </div>
                          <p className="text-sm text-blue-900 dark:text-blue-200">
                            {typeof skill.learningStrategy === 'string' ? skill.learningStrategy : JSON.stringify(skill.learningStrategy)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Current Level Slider */}
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                      <span>Update Current Level</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {skill.currentLevel}/10
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={skill.currentLevel}
                      onChange={(e) => handleProgressUpdate(skill.id, parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Beginner</span>
                      <span>Intermediate</span>
                      <span>Expert</span>
                    </div>
                  </div>

                  {/* Resources Count */}
                  {skill.resourceCount !== undefined && skill.resourceCount > 0 && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{skill.resourceCount} learning resources available</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onFindResources?.(skill.skillName)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Find Resources
                    </button>
                    <button 
                      onClick={() => setEditingSkill(skill)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {sortedSkills.filter(s => (s.targetLevel - s.currentLevel) <= 2).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Nearly Proficient
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {sortedSkills.filter(s => {
              const gap = s.targetLevel - s.currentLevel;
              return gap >= 3 && gap < 5;
            }).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Needs Practice
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {sortedSkills.filter(s => (s.targetLevel - s.currentLevel) >= 5).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Beginner Level
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {(sortedSkills.reduce((acc, s) => acc + s.currentLevel, 0) / sortedSkills.length).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Avg Level
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal 
        goalId={goalId} 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* Edit Skill Modal */}
      {editingSkill && (
        <EditSkillModal 
          goalId={goalId} 
          skill={editingSkill}
          isOpen={true} 
          onClose={() => setEditingSkill(null)} 
        />
      )}
    </div>
  );
}
