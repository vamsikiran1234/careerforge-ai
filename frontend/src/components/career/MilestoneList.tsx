import { useState } from 'react';
import type { Milestone } from '../../store/career';
import { useCareerStore } from '../../store/career';
import { useToast } from '../ui/Toast';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import AddMilestoneModal from './modals/AddMilestoneModal';
import EditMilestoneModal from './modals/EditMilestoneModal';

interface MilestoneListProps {
  goalId: string;
  milestones: Milestone[];
}

export default function MilestoneList({ goalId, milestones }: MilestoneListProps) {
  const { completeMilestone, updateMilestoneProgress, deleteMilestone, updateMilestone, undoDelete, isLoading } = useCareerStore();
  const toast = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  const handleComplete = async (milestoneId: string) => {
    await completeMilestone(goalId, milestoneId);
  };

  const handleProgressUpdate = async (milestoneId: string, progress: number) => {
    await updateMilestoneProgress(goalId, milestoneId, progress);
  };

  const handleDelete = async (milestoneId: string, milestoneTitle: string) => {
    if (window.confirm(`Are you sure you want to delete milestone "${milestoneTitle}"?`)) {
      try {
        await deleteMilestone(goalId, milestoneId);
        
        // Show undo toast
        toast.custom(
          'Milestone deleted',
          'success',
          {
            label: 'Undo',
            onClick: undoDelete
          },
          5000
        );
      } catch (error) {
        console.error('Failed to delete milestone:', error);
        toast.error('Failed to delete milestone');
      }
    }
  };

  const handleRevert = async (milestoneId: string) => {
    try {
      await updateMilestone(goalId, milestoneId, { 
        status: 'IN_PROGRESS',
        completedAt: null,
        progress: 50 // Reset to 50% when reverting
      });
    } catch (error) {
      console.error('Failed to revert milestone:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'BLOCKED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'BLOCKED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  if (sortedMilestones.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <Circle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Milestones Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Add milestones to track your progress toward your career goal.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add First Milestone
          </button>
        </div>
        <AddMilestoneModal 
          goalId={goalId} 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Milestones ({sortedMilestones.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {sortedMilestones.filter(m => m.status === 'COMPLETED').length} completed, {' '}
            {sortedMilestones.filter(m => m.status === 'IN_PROGRESS').length} in progress
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </button>
      </div>

      {/* Milestones List */}
      <div className="space-y-3">
        {sortedMilestones.map((milestone, index) => {
          const isExpanded = expandedId === milestone.id;
          const isOverdue = milestone.targetDate && new Date(milestone.targetDate) < new Date() && milestone.status !== 'COMPLETED';

          return (
            <div
              key={milestone.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                isExpanded 
                  ? 'border-emerald-300 dark:border-emerald-700 shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Milestone Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : milestone.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Order Number & Status */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {getStatusIcon(milestone.status)}
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 dark:bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {milestone.title}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(milestone.status)}`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {milestone.description}
                      </p>
                    )}

                    {/* Metadata Row */}
                    <div className="flex flex-wrap gap-4 text-xs">
                      {milestone.targetDate && (
                        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                          <Calendar className="w-3 h-3" />
                          {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}
                          {isOverdue && ' (Overdue)'}
                        </div>
                      )}
                      {milestone.priority && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          milestone.priority === 'HIGH'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : milestone.priority === 'MEDIUM'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        }`}>
                          {milestone.priority} Priority
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {milestone.status !== 'COMPLETED' && milestone.status !== 'NOT_STARTED' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(milestone.progress || 0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${milestone.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                  {/* AI Guidance */}
                  {milestone.aiGuidance && (
                    <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">AI</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">
                              AI Guidance
                            </h4>
                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                              Personalized
                            </span>
                          </div>
                          
                          {(() => {
                            // Parse the guidance if it's a JSON string
                            let guidanceData;
                            try {
                              guidanceData = typeof milestone.aiGuidance === 'string' 
                                ? JSON.parse(milestone.aiGuidance) 
                                : milestone.aiGuidance;
                            } catch {
                              guidanceData = { text: milestone.aiGuidance };
                            }

                            return (
                              <div className="space-y-3">
                                {/* Action Steps */}
                                {guidanceData.actionSteps && Array.isArray(guidanceData.actionSteps) && guidanceData.actionSteps.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2 uppercase tracking-wide">
                                      📋 Action Steps
                                    </h5>
                                    <ul className="space-y-1.5">
                                      {guidanceData.actionSteps.map((step: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-purple-900 dark:text-purple-200">
                                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold mt-0.5">
                                            {idx + 1}
                                          </span>
                                          <span className="flex-1">{step}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Resources */}
                                {guidanceData.resources && Array.isArray(guidanceData.resources) && guidanceData.resources.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2 uppercase tracking-wide">
                                      📚 Recommended Resources
                                    </h5>
                                    <ul className="space-y-1">
                                      {guidanceData.resources.map((resource: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-purple-900 dark:text-purple-200">
                                          <span className="text-purple-400 dark:text-purple-500">•</span>
                                          <span>{resource}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Success Criteria */}
                                {guidanceData.successCriteria && (
                                  <div className="p-3 bg-white dark:bg-gray-800/50 rounded-lg border border-purple-200 dark:border-purple-700">
                                    <h5 className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1.5 uppercase tracking-wide">
                                      ✓ Success Criteria
                                    </h5>
                                    <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">
                                      {guidanceData.successCriteria}
                                    </p>
                                  </div>
                                )}

                                {/* Plain text fallback */}
                                {!guidanceData.actionSteps && !guidanceData.resources && !guidanceData.successCriteria && guidanceData.text && (
                                  <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">
                                    {guidanceData.text}
                                  </p>
                                )}
                                
                                {/* Raw string fallback */}
                                {typeof guidanceData === 'string' && (
                                  <p className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed">
                                    {guidanceData}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Progress Slider (for IN_PROGRESS status) */}
                  {milestone.status === 'IN_PROGRESS' && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Update Progress
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={milestone.progress || 0}
                        onChange={(e) => handleProgressUpdate(milestone.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>0%</span>
                        <span className="font-semibold">{milestone.progress || 0}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {milestone.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleComplete(milestone.id)}
                        disabled={isLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRevert(milestone.id)}
                        disabled={isLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
                      >
                        <Circle className="w-4 h-4" />
                        Mark Incomplete
                      </button>
                    )}
                    <button 
                      onClick={() => setEditingMilestone(milestone)}
                      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(milestone.id, milestone.title)}
                      disabled={isLoading}
                      className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Completion Info */}
                  {milestone.status === 'COMPLETED' && milestone.completedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Completed on {format(new Date(milestone.completedAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Milestone Modal */}
      <AddMilestoneModal 
        goalId={goalId} 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <EditMilestoneModal 
          goalId={goalId} 
          milestone={editingMilestone}
          isOpen={true} 
          onClose={() => setEditingMilestone(null)} 
        />
      )}
    </div>
  );
}
