import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../../store/quiz';
import { useAuthStore } from '../../store/auth';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/Loading';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  TrendingUp,
  Award,
  Clock,
  BarChart3,
  Eye
} from 'lucide-react';

interface QuizHistoryProps {
  onBack: () => void;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { getUserQuizSessions, isLoading, error } = useQuizStore();
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) return;
      
      try {
        const userSessions = await getUserQuizSessions(user.id);
        setSessions(userSessions || []);
      } catch (error) {
        console.error('Failed to load quiz history:', error);
      }
    };

    loadHistory();
  }, [user?.id, getUserQuizSessions]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStatus = (session: any) => {
    if (session.completedAt) {
      return { status: 'Completed', color: 'green' };
    } else {
      return { status: 'In Progress', color: 'blue' };
    }
  };

  const getSessionDuration = (session: any) => {
    if (!session.completedAt) return 'In Progress';
    
    const start = new Date(session.createdAt);
    const end = new Date(session.completedAt);
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '< 1 min';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    return `${Math.round(diffMinutes / 60)}h ${diffMinutes % 60}m`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="flex items-center justify-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-600">Loading quiz history...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center space-y-4">
            <div className="text-red-600 text-lg font-semibold">Error</div>
            <p className="text-red-700">{error}</p>
            <Button onClick={onBack} variant="outline" className="border-red-300 text-red-700">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment History</h1>
            <p className="text-gray-600">Review your completed career assessments</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
          <div className="text-sm text-gray-500">Total Assessments</div>
        </div>
      </div>

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessions.filter(s => s.completedAt).length}
            </div>
            <div className="text-gray-600">Completed</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessions.filter(s => !s.completedAt).length}
            </div>
            <div className="text-gray-600">In Progress</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {sessions.length > 0 ? 
                Math.round(sessions.filter(s => s.completedAt).length / sessions.length * 100) : 0
              }%
            </div>
            <div className="text-gray-600">Completion Rate</div>
          </Card>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => {
            const { status, color } = getSessionStatus(session);
            
            return (
              <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Career Assessment
                        </h3>
                      </div>
                      <span 
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${color === 'green' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                          }
                        `}
                      >
                        {status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {formatDate(session.createdAt)}</span>
                      </div>
                      
                      {session.completedAt && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {getSessionDuration(session)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <BarChart3 className="w-4 h-4" />
                        <span>Stage: {session.currentStage?.replace('_', ' ') || 'Unknown'}</span>
                      </div>
                      
                      {session.results && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Award className="w-4 h-4" />
                          <span>
                            {session.results.careerSuggestions?.length || 0} Career Matches
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {session.results?.careerSuggestions?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Top Career Match:</p>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                            {session.results.careerSuggestions[0].title || 'Career Suggestion'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {session.results.careerSuggestions[0].matchScore || 95}% match
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {session.completedAt && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Results</span>
                      </Button>
                    )}
                    
                    {!session.completedAt && (
                      <Button 
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <span>Continue</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No Assessments Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              You haven't taken any career assessments yet. Start your first assessment 
              to discover your ideal career path.
            </p>
            <Button onClick={onBack} className="mt-4">
              Take Your First Assessment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuizHistory;
