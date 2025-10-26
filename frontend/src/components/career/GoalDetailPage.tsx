import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCareerStore } from '../../store/career';
import { 
  ArrowLeft, 
  Target, 
  Calendar, 
  TrendingUp, 
  Edit, 
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import TrajectoryVisualization from './visualizations/TrajectoryVisualization.js';
import MilestoneTimeline from './visualizations/MilestoneTimeline.js';
import SkillGapMatrix from './visualizations/SkillGapMatrix.js';
import ProgressChart from './visualizations/ProgressChart.js';
import MilestoneList from './MilestoneList.js';
import SkillGapList from './SkillGapList.js';
import LearningResourceList from './LearningResourceList.js';

type TabType = 'overview' | 'milestones' | 'skills' | 'resources';

export default function GoalDetailPage() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { currentGoal, setCurrentGoal, deleteGoal, isLoading, generateSkillResources } = useCareerStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [isGeneratingResources, setIsGeneratingResources] = useState(false);

  const handleFindResources = async (skillName: string) => {
    if (!goalId) return;
    
    // Check if resources exist for this goal
    const hasResources = currentGoal?.learningResources && currentGoal.learningResources.length > 0;
    
    if (!hasResources) {
      // No resources exist - generate them
      try {
        setIsGeneratingResources(true);
        await generateSkillResources(goalId, skillName);
        setResourceFilter(skillName);
        setActiveTab('resources');
        
        // Scroll to resources section
        setTimeout(() => {
          const resourcesSection = document.querySelector('[data-tab="resources"]');
          if (resourcesSection) {
            resourcesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } catch (error) {
        console.error('Failed to generate resources:', error);
      } finally {
        setIsGeneratingResources(false);
      }
    } else {
      // Resources exist - just filter and navigate
      setActiveTab('resources');
      setResourceFilter(skillName);
      
      // Scroll to resources section
      setTimeout(() => {
        const resourcesSection = document.querySelector('[data-tab="resources"]');
        if (resourcesSection) {
          resourcesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (goalId) {
      setCurrentGoal(goalId);
    }
  }, [goalId, setCurrentGoal]);

  const handleDelete = async () => {
    if (!goalId) return;
    await deleteGoal(goalId);
    navigate('/career');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded mb-6"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const goal = currentGoal;
  
  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Goal Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The career goal you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              to="/career"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Career Goals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const completedMilestones = goal.milestones?.filter(m => m.status === 'COMPLETED').length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: TrendingUp },
    { id: 'milestones' as TabType, label: 'Milestones', icon: CheckCircle2, count: totalMilestones },
    { id: 'skills' as TabType, label: 'Skills', icon: Target, count: goal.skillGaps?.length || 0 },
    { id: 'resources' as TabType, label: 'Resources', icon: Sparkles, count: goal.learningResources?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/career"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Career Goals
          </Link>

          {/* Goal Header Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {goal.targetRole}
                  </h1>
                  {goal.aiGenerated && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-sm">From</span>
                  <span className="font-medium text-gray-900 dark:text-white">{goal.currentRole}</span>
                  <span className="text-gray-400">→</span>
                  <span className="font-medium text-gray-900 dark:text-white">{goal.targetRole}</span>
                  {goal.targetCompany && (
                    <>
                      <span className="text-gray-400">@</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">{goal.targetCompany}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/career/edit/${goalId}`)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(goal.progress)}%
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Milestones</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedMilestones}/{totalMilestones}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {totalMilestones > 0 ? `${Math.round((completedMilestones / totalMilestones) * 100)}% complete` : 'No milestones yet'}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Skills</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {goal.skillGaps?.length || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  skills to develop
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-green-600'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Timeline</span>
                </div>
                <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {Math.abs(daysRemaining)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isOverdue ? 'days overdue' : 'days remaining'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 border-b-0">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Trajectory Visualization */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Career Trajectory
                </h3>
                <TrajectoryVisualization goal={goal} />
              </div>

              {/* Milestone Timeline */}
              {totalMilestones > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Milestone Timeline
                  </h3>
                  <MilestoneTimeline milestones={goal.milestones || []} />
                </div>
              )}

              {/* Skill Gap Matrix */}
              {goal.skillGaps && goal.skillGaps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Skill Gap Analysis
                  </h3>
                  <SkillGapMatrix skillGaps={goal.skillGaps} />
                </div>
              )}

              {/* Progress Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Progress Over Time
                </h3>
                <ProgressChart goalId={goal.id} />
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <MilestoneList goalId={goal.id} milestones={goal.milestones || []} />
          )}

          {activeTab === 'skills' && (
            <SkillGapList 
              goalId={goal.id} 
              skillGaps={goal.skillGaps || []} 
              onFindResources={handleFindResources}
            />
          )}

          {activeTab === 'resources' && (
            <div data-tab="resources">
              <LearningResourceList 
                goalId={goal.id} 
                resources={goal.learningResources || []} 
                highlightSkill={resourceFilter}
                onClearFilter={() => setResourceFilter('')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Career Goal
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this career goal? This action cannot be undone and will also delete all associated milestones, skill gaps, and learning resources.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                Delete Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
