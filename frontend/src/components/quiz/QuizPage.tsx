import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../../store/quiz';
import { useAuthStore } from '../../store/auth';
import { LoadingSpinner } from '../ui/Loading';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import QuizInterface from './QuizInterface';
import QuizResults from './QuizResults';
import QuizHistory from './QuizHistory';
import { 
  PlayCircle, 
  Clock, 
  Target, 
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const QuizPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    currentSession, 
    results, 
    isLoading, 
    error, 
    startQuiz, 
    resetQuiz,
    clearError 
  } = useQuizStore();
  
  const [view, setView] = useState<'start' | 'quiz' | 'results' | 'history'>('start');
  const [historyResults, setHistoryResults] = useState<any>(null);

  useEffect(() => {
    if (currentSession) {
      setView('quiz');
    } else if (results) {
      setView('results');
    } else {
      setView('start');
    }
  }, [currentSession, results]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleStartQuiz = async () => {
    if (!user?.id) {
      console.error('No user ID found. User:', user);
      alert('Please log in to start the quiz');
      return;
    }
    
    console.log('Starting quiz for user:', user.id);
    
    try {
      await startQuiz(user.id);
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      // Error will be displayed in the UI via error state
    }
  };

  const handleNewQuiz = () => {
    resetQuiz();
    setHistoryResults(null);
    setView('start');
  };

  const handleViewHistoryResults = (sessionResults: any) => {
    console.log('📊 QuizPage: Viewing historical results:', sessionResults);
    setHistoryResults(sessionResults);
    setView('results');
  };

  const renderStartView = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Career Assessment Quiz</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover your ideal career path through our comprehensive assessment. 
          Answer questions about your skills, interests, and preferences to get personalized recommendations.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills Assessment</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Evaluate your technical and soft skills to understand your strengths
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interest Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Discover what truly motivates and excites you in your career
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
            <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Career Matching</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get personalized career recommendations based on your profile
          </p>
        </Card>
      </div>

      {/* Quiz Info */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">What to Expect</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></span>
                20-30 adaptive questions across 5 assessment stages
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></span>
                Approximately 15-20 minutes to complete
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></span>
                Questions adapt based on your previous answers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mr-3"></span>
                Detailed career recommendations and action plan
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={handleStartQuiz} 
          disabled={isLoading || !user}
          className="flex items-center justify-center space-x-2 px-8 py-3"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Starting Quiz...</span>
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              <span>Start Assessment</span>
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setView('history')}
          className="flex items-center justify-center space-x-2 px-8 py-3"
        >
          <BarChart3 className="w-5 h-5" />
          <span>View History</span>
        </Button>
      </div>

      {!user && (
        <div className="text-center">
          <p className="text-gray-600">
            Please <a href="/login" className="text-blue-600 hover:underline">log in</a> to take the assessment
          </p>
        </div>
      )}
    </div>
  );

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-center space-y-4">
            <div className="text-red-600 text-lg font-semibold">Error</div>
            <p className="text-red-700">{error}</p>
            <Button 
              onClick={() => {
                clearError();
                setView('start');
              }}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {view === 'start' && renderStartView()}
        {view === 'quiz' && currentSession && (
          <QuizInterface onComplete={() => setView('results')} />
        )}
        {view === 'results' && (results || historyResults) && (
          <QuizResults 
            results={historyResults || results} 
            onNewQuiz={handleNewQuiz}
            onViewHistory={() => setView('history')}
          />
        )}
        {view === 'history' && (
          <QuizHistory 
            onBack={() => setView('start')} 
            onViewResults={handleViewHistoryResults}
          />
        )}
      </div>
    </div>
  );
};

export default QuizPage;
