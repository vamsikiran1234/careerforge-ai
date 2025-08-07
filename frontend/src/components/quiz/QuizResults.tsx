import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { QuizResult } from '../../store/quiz';
import { 
  Award, 
  Target, 
  TrendingUp, 
  Star,
  CheckCircle,
  ArrowRight,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface QuizResultsProps {
  results: QuizResult;
  onNewQuiz: () => void;
  onViewHistory: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ 
  results, 
  onNewQuiz, 
  onViewHistory 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Award className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Assessment Complete!</h1>
        <p className="text-xl text-gray-600">
          Your personalized career recommendations are ready
        </p>
        <p className="text-sm text-gray-500">
          Completed on {formatDate(results.completedAt)}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {results.careerSuggestions?.length || 0}
          </div>
          <div className="text-gray-600">Career Matches</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {results.recommendations?.length || 0}
          </div>
          <div className="text-gray-600">Recommendations</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">100%</div>
          <div className="text-gray-600">Assessment Complete</div>
        </Card>
      </div>

      {/* Career Suggestions */}
      {results.careerSuggestions && results.careerSuggestions.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Top Career Matches</h2>
          </div>
          
          <div className="space-y-4">
            {results.careerSuggestions.map((career: any, index: number) => (
              <div 
                key={index}
                className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {career.title || `Career Option ${index + 1}`}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {career.matchScore || '95'}% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {career.description || 'This career path aligns well with your assessed skills, interests, and values.'}
                    </p>
                    
                    {career.skills && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900">Key Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {career.skills.slice(0, 5).map((skill: string, skillIndex: number) => (
                            <span 
                              key={skillIndex}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      #{index + 1}
                    </div>
                    <div className="text-sm text-gray-500">Ranked</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h2>
          </div>
          
          <div className="space-y-4">
            {results.recommendations.map((recommendation: any, index: number) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">
                    {typeof recommendation === 'string' 
                      ? recommendation 
                      : recommendation.text || `Recommendation ${index + 1}`
                    }
                  </p>
                  {typeof recommendation === 'object' && recommendation.action && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Action:</strong> {recommendation.action}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900">What's Next?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use these insights to guide your career decisions. Consider exploring our 
            mentorship program or taking additional assessments to refine your path.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Button 
              onClick={onNewQuiz}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Take New Assessment</span>
            </Button>
            
            <Button 
              onClick={onViewHistory}
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View History</span>
            </Button>
            
            <Button className="flex items-center space-x-2">
              <span>Find Mentors</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Empty State for Missing Data */}
      {(!results.careerSuggestions || results.careerSuggestions.length === 0) && 
       (!results.recommendations || results.recommendations.length === 0) && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Assessment Completed</h3>
            <p className="text-gray-600">
              Your responses have been recorded. Detailed analysis and recommendations 
              will be available shortly.
            </p>
            <Button onClick={onNewQuiz} className="mt-4">
              Take Another Assessment
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuizResults;
