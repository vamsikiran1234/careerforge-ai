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
    if (!user?.id) return;
    
    try {
      await startQuiz(user.id);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleNewQuiz = () => {
    resetQuiz();
    setView('start');
  };

  const renderStartView = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Career Assessment Quiz</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover your ideal career path through our comprehensive assessment. 
          Answer questions about your skills, interests, and preferences to get personalized recommendations.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills Assessment</h3>
          <p className="text-gray-600">
            Evaluate your technical and soft skills to understand your strengths
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Interest Analysis</h3>
          <p className="text-gray-600">
            Discover what truly motivates and excites you in your career
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-4">
            <Award className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Matching</h3>
          <p className="text-gray-600">
            Get personalized career recommendations based on your profile
          </p>
        </Card>
      </div>

      {/* Quiz Info */}
      <Card className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What to Expect</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                20-30 adaptive questions across 5 assessment stages
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Approximately 15-20 minutes to complete
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Questions adapt based on your previous answers
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {view === 'start' && renderStartView()}
        {view === 'quiz' && currentSession && (
          <QuizInterface onComplete={() => setView('results')} />
        )}
        {view === 'results' && results && (
          <QuizResults 
            results={results} 
            onNewQuiz={handleNewQuiz}
            onViewHistory={() => setView('history')}
          />
        )}
        {view === 'history' && (
          <QuizHistory onBack={() => setView('start')} />
        )}
      </div>
    </div>
  );
};

export default QuizPage;
