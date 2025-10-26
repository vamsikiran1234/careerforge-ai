import type { Milestone } from '../../../store/career';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

export default function MilestoneTimeline({ milestones }: MilestoneTimelineProps) {
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'BLOCKED':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      case 'BLOCKED':
        return 'bg-red-500';
      default:
        return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      BLOCKED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      NOT_STARTED: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };
    return colors[status as keyof typeof colors] || colors.NOT_STARTED;
  };

  if (sortedMilestones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Circle className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No milestones added yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      {/* Milestones */}
      <div className="space-y-6">
        {sortedMilestones.map((milestone, index) => {
          const isOverdue = milestone.targetDate && new Date(milestone.targetDate) < new Date() && milestone.status !== 'COMPLETED';
          
          return (
            <div key={milestone.id} className="relative flex gap-6 group">
              {/* Timeline Icon */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full ${getStatusColor(milestone.status)} flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-800`}>
                  {getStatusIcon(milestone.status)}
                </div>
                {/* Order Number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-700 dark:bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
              </div>

              {/* Milestone Content */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 group-hover:shadow-md group-hover:border-emerald-300 dark:group-hover:border-emerald-700 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {milestone.title}
                    </h4>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {milestone.description}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(milestone.status)}`}>
                    {milestone.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {milestone.targetDate && (
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                        {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  )}
                  {milestone.priority && (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        milestone.priority === 'HIGH'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : milestone.priority === 'MEDIUM'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {milestone.priority}
                      </span>
                    </div>
                  )}
                  {milestone.progress !== undefined && milestone.progress > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {Math.round(milestone.progress)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Guidance */}
                {milestone.aiGuidance && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg shadow-sm">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
