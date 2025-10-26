import type { CareerGoal } from '../../../store/career';
import { Target, TrendingUp, Award } from 'lucide-react';

interface TrajectoryVisualizationProps {
  goal: CareerGoal;
}

export default function TrajectoryVisualization({ goal }: TrajectoryVisualizationProps) {
  const milestones = goal.milestones || [];
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
  
  // Calculate positions for visual flow
  const totalSteps = sortedMilestones.length + 2; // Current + milestones + target
  const completedMilestones = sortedMilestones.filter(m => m.status === 'COMPLETED').length;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-xl p-8">
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-12 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
            style={{ 
              width: `${(completedMilestones / (totalSteps - 2)) * 100}%` 
            }}
          />
        </div>

        {/* Journey Steps */}
        <div className="relative grid gap-4" style={{ 
          gridTemplateColumns: `repeat(${Math.min(totalSteps, 5)}, 1fr)` 
        }}>
          {/* Current Position */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-3 shadow-lg ring-4 ring-white dark:ring-gray-800">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                Current
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {goal.currentRole}
              </div>
              {goal.currentCompany && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  @ {goal.currentCompany}
                </div>
              )}
            </div>
          </div>

          {/* Milestones (show first 3) */}
          {sortedMilestones.slice(0, 3).map((milestone, index) => {
            const isCompleted = milestone.status === 'COMPLETED';
            const isInProgress = milestone.status === 'IN_PROGRESS';
            
            return (
              <div key={milestone.id} className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-3 shadow-lg ring-4 ring-white dark:ring-gray-800 transition-all ${
                  isCompleted
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    : isInProgress
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse'
                    : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600'
                }`}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {index + 1}
                    </div>
                    {isCompleted && (
                      <div className="text-xs text-white/90 mt-1">✓</div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Milestone {index + 1}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white max-w-[120px] truncate">
                    {milestone.title}
                  </div>
                  {milestone.targetDate && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(milestone.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Target Position */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 shadow-lg ring-4 ring-white dark:ring-gray-800">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">
                Target
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {goal.targetRole}
              </div>
              {goal.targetCompany && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  @ {goal.targetCompany}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Milestones Indicator */}
        {sortedMilestones.length > 3 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-full shadow-sm">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                +{sortedMilestones.length - 3} more milestones
              </span>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {completedMilestones}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Completed
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sortedMilestones.filter(m => m.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              In Progress
            </div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {sortedMilestones.filter(m => m.status === 'NOT_STARTED').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Upcoming
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
