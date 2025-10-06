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
  onViewResults?: (session: any) => void;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ onBack, onViewResults }) => {
  const { user } = useAuthStore();
  const { getUserQuizSessions, isLoading, error } = useQuizStore();
  const [sessions, setSessions] = useState<any[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    const loadHistory = async () => {
      // Prevent duplicate calls
      if (!user?.id || hasLoadedRef.current || isLoadingLocal) {
        console.log('⏭️ Skipping load:', { 
          hasUserId: !!user?.id, 
          hasLoaded: hasLoadedRef.current, 
          isLoading: isLoadingLocal 
        });
        return;
      }
      
      hasLoadedRef.current = true;
      setIsLoadingLocal(true);
      
      try {
        console.log('📥 QuizHistory: Fetching quiz sessions for user:', user.id);
        setLocalError(null);
        const userSessions = await getUserQuizSessions(user.id);
        console.log('📥 QuizHistory: Received sessions:', userSessions);
        console.log('📥 QuizHistory: Sessions type:', typeof userSessions);
        console.log('📥 QuizHistory: Is array?', Array.isArray(userSessions));
        console.log('📥 QuizHistory: Sessions length:', userSessions?.length);
        
        const sessionsArray = Array.isArray(userSessions) ? userSessions : [];
        console.log('📥 QuizHistory: Setting sessions to:', sessionsArray);
        setSessions(sessionsArray);
        
        // Force a re-render after a small delay to ensure state is updated
        setTimeout(() => {
          console.log('📥 QuizHistory: Current sessions state:', sessionsArray.length);
        }, 100);
      } catch (error: any) {
        console.error('❌ QuizHistory: Failed to load quiz history:', error);
        setLocalError(error.message || 'Failed to load quiz history');
        hasLoadedRef.current = false; // Allow retry
      } finally {
        setIsLoadingLocal(false);
      }
    };

    loadHistory();
  }, [user?.id]); // Remove getUserQuizSessions from dependencies to prevent infinite loop

  // Log sessions whenever they change
  useEffect(() => {
    console.log('📊 QuizHistory: Sessions state updated:', sessions.length, 'sessions');
  }, [sessions]);

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

  const getCareerMatchesCount = (session: any) => {
    if (!session.results) return 0;
    
    // Parse results if it's a string
    let results = session.results;
    if (typeof results === 'string') {
      try {
        results = JSON.parse(results);
      } catch (e) {
        console.error('Failed to parse results:', e);
        return 0;
      }
    }
    
    // Check various possible structures
    // Structure 1: recommendations.topCareers (from AI service)
    if (results.recommendations?.topCareers && Array.isArray(results.recommendations.topCareers)) {
      return results.recommendations.topCareers.length;
    }
    // Structure 2: topCareers directly
    if (results.topCareers && Array.isArray(results.topCareers)) {
      return results.topCareers.length;
    }
    // Structure 3: careerSuggestions
    if (results.careerSuggestions && Array.isArray(results.careerSuggestions)) {
      return results.careerSuggestions.length;
    }
    // Structure 4: careers
    if (results.careers && Array.isArray(results.careers)) {
      return results.careers.length;
    }
    
    return 0;
  };

  const handleViewResults = (sessionId: string) => {
    // Find the session with the given ID
    const session = sessions.find(s => s.id === sessionId);
    
    if (session && onViewResults) {
      console.log('📊 Viewing results for session:', session);
      
      // Parse results if it's a string
      let resultsData = session.results;
      if (typeof resultsData === 'string') {
        try {
          resultsData = JSON.parse(resultsData);
        } catch (e) {
          console.error('Failed to parse results:', e);
        }
      }
      
      // Call the parent callback with formatted results
      onViewResults({
        sessionId: session.id,
        recommendations: resultsData,
        completedAt: session.completedAt,
      });
    } else {
      console.warn('Session not found or no callback provided:', sessionId);
    }
  };

  if (isLoading || isLoadingLocal) {
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

  if (error || localError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 border-red-200 bg-red-50">
          <div className="text-center space-y-4">
            <div className="text-red-600 text-lg font-semibold">Error</div>
            <p className="text-red-700">{error || localError}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={onBack} variant="outline" className="border-red-300 text-red-700">
                Go Back
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="border-blue-300 text-blue-700"
              >
                Retry
              </Button>
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assessment History</h1>
            <p className="text-gray-600 dark:text-gray-400">Review your completed career assessments</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Assessments</div>
        </div>
      </div>

      {/* Summary Stats */}
      {sessions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
              <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessions.filter(s => s.completedAt).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Completed</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessions.filter(s => !s.completedAt).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">In Progress</div>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {sessions.length > 0 ? 
                Math.round(sessions.filter(s => s.completedAt).length / sessions.length * 100) : 0
              }%
            </div>
            <div className="text-gray-600 dark:text-gray-400">Completion Rate</div>
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
                        <Target className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Career Assessment
                        </h3>
                      </div>
                      <span 
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${color === 'green' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }
                        `}
                      >
                        {status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {formatDate(session.createdAt)}</span>
                      </div>
                      
                      {session.completedAt && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {getSessionDuration(session)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <BarChart3 className="w-4 h-4" />
                        <span>Stage: {session.currentStage?.replace('_', ' ') || 'Unknown'}</span>
                      </div>
                      
                      {session.completedAt && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Award className="w-4 h-4" />
                          <span>
                            {getCareerMatchesCount(session)} Career Matches
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {(() => {
                      const careerCount = getCareerMatchesCount(session);
                      if (careerCount === 0) return null;
                      
                      // Parse results to get top career
                      let results = session.results;
                      if (typeof results === 'string') {
                        try {
                          results = JSON.parse(results);
                        } catch {
                          return null;
                        }
                      }
                      
                      // Get first career from various possible structures
                      let topCareer = null;
                      if (results?.recommendations?.topCareers?.[0]) {
                        topCareer = results.recommendations.topCareers[0];
                      } else if (results?.topCareers?.[0]) {
                        topCareer = results.topCareers[0];
                      } else if (results?.careerSuggestions?.[0]) {
                        topCareer = results.careerSuggestions[0];
                      } else if (results?.careers?.[0]) {
                        topCareer = results.careers[0];
                      }
                      
                      if (!topCareer) return null;
                      
                      return (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Top Career Match:</p>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full font-medium">
                              {topCareer.title || topCareer.name || 'Career Suggestion'}
                            </span>
                            {topCareer.match_percentage && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {topCareer.match_percentage}% match
                              </span>
                            )}
                            {topCareer.matchScore && (
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {topCareer.matchScore}% match
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {session.completedAt && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewResults(session.id)}
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Results</span>
                      </Button>
                    )}
                    
                    {!session.completedAt && (
                      <Button 
                        size="sm"
                        onClick={() => {
                          // TODO: Implement continue functionality
                          console.log('Continue session:', session.id);
                          alert('Continue functionality coming soon!');
                        }}
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
