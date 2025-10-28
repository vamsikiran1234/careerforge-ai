import { useNavigate } from 'react-router-dom';
import type { CareerGoal } from '../../store/career';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import useCareerStore from '../../store/career';

interface GoalCardProps {
  goal: CareerGoal;
}

const GoalCard = ({ goal }: GoalCardProps) => {
  const navigate = useNavigate();
  const { deleteGoal } = useCareerStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const completedMilestones = goal.milestones?.filter(m => m.status === 'COMPLETED').length || 0;
  const totalMilestones = goal.milestones?.length || 0;
  const milestonesFromCount = goal._count?.milestones || totalMilestones;
  
  const skillsCount = goal.skillGaps?.length || goal._count?.skillGaps || 0;

  const statusColors = {
    ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    ACHIEVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    POSTPONED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteGoal(goal.id);
      } catch (error) {
        console.error('Failed to delete goal:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/career/${goal.id}/edit`);
  };

  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;

  return (
    <div
      onClick={() => navigate(`/app/career/${goal.id}`)}
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer group relative ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Status Badge & Menu */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[goal.status]}`}>
          {goal.status}
        </span>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Goal
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Goal
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current -> Target */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span className="font-medium">{goal.currentRole}</span>
          {goal.currentCompany && (
            <span className="text-xs">@ {goal.currentCompany}</span>
          )}
        </div>
        <div className="flex items-center gap-2 my-2">
          <ArrowRight className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
          <span>{goal.targetRole}</span>
          {goal.targetCompany && (
            <span className="text-xs font-normal text-gray-500">@ {goal.targetCompany}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-semibold text-gray-900 dark:text-white">{goal.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1">Milestones</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">
            {completedMilestones}/{milestonesFromCount}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-center mb-1">
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1">Skills</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">
            {skillsCount}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1">Timeline</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white text-center">
            {goal.timeframeMonths}mo
          </p>
        </div>
      </div>

      {/* Time Remaining */}
      <div className={`flex items-center gap-2 text-sm ${
        isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
      }`}>
        <Calendar className="w-4 h-4" />
        <span>
          {isOverdue 
            ? `Overdue by ${Math.abs(daysRemaining)} days`
            : daysRemaining === 0
            ? 'Due today'
            : daysRemaining === 1
            ? '1 day remaining'
            : `${daysRemaining} days remaining`
          }
        </span>
      </div>

      {/* AI Generated Badge */}
      {goal.aiGenerated && (
        <div className="absolute top-4 right-16 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          AI
        </div>
      )}

      {/* Hover Effect */}
      <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

export default GoalCard;
