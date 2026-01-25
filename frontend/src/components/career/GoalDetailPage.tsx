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

  // Refresh goal data when currentGoal changes to ensure UI stays in sync
  useEffect(() => {
    // This ensures components re-render when goal data updates
  }, [currentGoal]);

  const handleDelete = async () => {
    if (!goalId) return;
    await deleteGoal(goalId);
    navigate('/career');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="w-1/4 h-8 mb-6 bg-gray-300 rounded dark:bg-gray-700"></div>
            <div className="h-64 mb-6 bg-gray-300 rounded dark:bg-gray-700"></div>
            <div className="bg-gray-300 rounded h-96 dark:bg-gray-700"></div>
          </div>
        </div>
      </div>
    );
  }

  const goal = currentGoal;
  
  if (!goal) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="py-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              Goal Not Found
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              The career goal you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              to="/career"
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg bg-emerald-600 hover:bg-emerald-700"
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
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/career"
            className="inline-flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Career Goals
          </Link>

          {/* Goal Header Card */}
          <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-xl dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {goal.targetRole}
                  </h1>
                  {goal.aiGenerated && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
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
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-gray-600 rounded-lg dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(goal.progress)}%
                </div>
                <div className="w-full h-2 mt-2 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Milestones</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedMilestones}/{totalMilestones}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {totalMilestones > 0 ? `${Math.round((completedMilestones / totalMilestones) * 100)}% complete` : 'No milestones yet'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Skills</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {goal.skillGaps?.length || 0}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  skills to develop
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-green-600'}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Timeline</span>
                </div>
                <div className={`text-2xl font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                  {Math.abs(daysRemaining)}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isOverdue ? 'days overdue' : 'days remaining'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-b-0 border-gray-200 shadow-sm dark:bg-gray-800 rounded-t-xl dark:border-gray-700">
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
        <div className="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-b-xl dark:border-gray-700">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Trajectory Visualization */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Career Trajectory
                </h3>
                <TrajectoryVisualization goal={goal} />
              </div>

              {/* Milestone Timeline */}
              {totalMilestones > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Milestone Timeline
                  </h3>
                  <MilestoneTimeline milestones={goal.milestones || []} />
                </div>
              )}

              {/* Skill Gap Matrix */}
              {goal.skillGaps && goal.skillGaps.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Skill Gap Analysis
                  </h3>
                  <SkillGapMatrix skillGaps={goal.skillGaps} />
                </div>
              )}

              {/* Progress Chart */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
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
              {isGeneratingResources && (
                <div className="p-3 mb-4 text-yellow-800 border border-yellow-100 rounded-md bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200">
                  Generating learning resources... this may take a moment.
                </div>
              )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-white shadow-xl dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900/30">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Career Goal
              </h3>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this career goal? This action cannot be undone and will also delete all associated milestones, skill gaps, and learning resources.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
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
