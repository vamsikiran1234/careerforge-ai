import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/quiz';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/Loading';
import { 
  ChevronRight, 
  Target, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface QuizInterfaceProps {
  onComplete: () => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ onComplete }) => {
  const { 
    currentSession, 
    isLoading, 
    error, 
    submitAnswer,
    clearError,
    results 
  } = useQuizStore();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    // Call onComplete when quiz is finished
    if (results) {
      onComplete();
    }
  }, [results, onComplete]);

  useEffect(() => {
    // Reset selected answer when question changes
    setSelectedAnswer('');
  }, [currentSession?.question?.text]);

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentSession || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitAnswer(
        currentSession.sessionId, 
        selectedAnswer, 
        currentSession.question.id
      );
      setSelectedAnswer('');
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStageDisplay = (stage: string) => {
    const stageMap: Record<string, string> = {
      'SKILLS_ASSESSMENT': 'Skills Assessment',
      'INTERESTS_ASSESSMENT': 'Interests Assessment', 
      'PERSONALITY_ASSESSMENT': 'Personality Assessment',
      'VALUES_ASSESSMENT': 'Values Assessment',
      'GOALS_ASSESSMENT': 'Goals Assessment',
    };
    return stageMap[stage] || stage;
  };

  const getStageDescription = (stage: string) => {
    const descriptionMap: Record<string, string> = {
      'SKILLS_ASSESSMENT': 'Let\'s evaluate your current skills and technical abilities',
      'INTERESTS_ASSESSMENT': 'Now let\'s explore what truly interests and motivates you',
      'PERSONALITY_ASSESSMENT': 'Understanding your personality will help us find the right fit',
      'VALUES_ASSESSMENT': 'What values are most important to you in your career?',
      'GOALS_ASSESSMENT': 'Finally, let\'s align your career goals with opportunities',
    };
    return descriptionMap[stage] || 'Continue with your assessment';
  };

  if (!currentSession) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <p className="text-gray-600">No active quiz session found.</p>
        </Card>
      </div>
    );
  }

  const { question, progress, currentStage } = currentSession;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
          <Target className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getStageDisplay(currentStage)}
        </h1>
        <p className="text-gray-600">{getStageDescription(currentStage)}</p>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            Stage {progress.currentStage} of {progress.totalStages}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>{progress.percentage}%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Question {progress.currentStage} of {progress.totalStages}</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {question.text}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className={`
                  block p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="quiz-answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">{option}</span>
                  {selectedAnswer === option && (
                    <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-500">
              Select an answer to continue
            </div>
            
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || isSubmitting || isLoading}
              className="flex items-center space-x-2 px-6 py-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stage Indicator */}
      <div className="flex justify-center">
        <div className="flex space-x-2">
          {Array.from({ length: progress.totalStages }, (_, i) => (
            <div
              key={i}
              className={`
                w-3 h-3 rounded-full transition-colors
                ${i + 1 <= progress.currentStage 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
