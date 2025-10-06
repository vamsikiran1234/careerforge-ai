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
  RefreshCw,
  BookOpen,
  Zap,
  DollarSign,
  MapPin,
  Users,
  Clock,
  Lightbulb
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

  // Extract data from the results object
  const recommendations = results?.recommendations || {};
  const topCareers = recommendations.topCareers || [];
  const skillsToFocus = recommendations.skillsToFocus || [];
  const learningPath = recommendations.learningPath || null;
  const nextSteps = recommendations.nextSteps || [];
  const marketInsights = recommendations.marketInsights || null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-4 shadow-lg animate-bounce-slow">
          <Award className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Assessment Complete!
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your personalized career recommendations are ready
        </p>
        {results.completedAt && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completed on {formatDate(results.completedAt)}
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {topCareers.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Career Matches</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {nextSteps.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400">Recommendations</div>
        </Card>

        <Card className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
          <div className="text-gray-600 dark:text-gray-400">Assessment Complete</div>
        </Card>
      </div>

      {/* Top Career Matches */}
      {topCareers.length > 0 && (
        <Card className="p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Career Matches</h2>
          </div>
          
          <div className="space-y-6">
            {topCareers.map((career: any, index: number) => (
              <div 
                key={index}
                className="relative p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 group"
              >
                {/* Ranking Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg">#{index + 1}</span>
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-8">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {career.title}
                      </h3>
                      <div className="flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full shadow-sm">
                        <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-current" />
                        <span className="text-base font-bold text-yellow-800 dark:text-yellow-300">
                          {career.match_percentage}% Match
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-base leading-relaxed">
                      {career.description}
                    </p>
                    
                    {career.why_match && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                          <strong className="font-semibold">💡 Why this matches:</strong> {career.why_match}
                        </p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      {career.salary_range && (
                        <div className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Salary Range</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{career.salary_range}</p>
                          </div>
                        </div>
                      )}
                      
                      {career.growth_potential && (
                        <div className="flex items-start space-x-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Growth</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{career.growth_potential}</p>
                          </div>
                        </div>
                      )}
                      
                      {career.learning_timeline && (
                        <div className="flex items-start space-x-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Timeline</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{career.learning_timeline}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {career.skills_required && career.skills_required.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                          <Zap className="w-4 h-4 mr-1 text-blue-600" />
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {career.skills_required.map((skill: string, skillIndex: number) => (
                            <span 
                              key={skillIndex}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-800 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skills to Focus */}
      {skillsToFocus.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skills to Focus On</h2>
          </div>
          
          <div className="space-y-4">
            {skillsToFocus.map((skill: any, index: number) => (
              <div 
                key={index}
                className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {skill.skill}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        skill.priority === 'High' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                          : skill.priority === 'Medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}>
                        {skill.priority} Priority
                      </span>
                      {skill.timeline && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {skill.timeline}
                        </span>
                      )}
                    </div>
                    
                    {skill.certification && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Recommended Certification:</strong> {skill.certification}
                      </p>
                    )}
                    
                    {skill.resources && skill.resources.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Learning Resources:</p>
                        <ul className="space-y-1">
                          {skill.resources.map((resource: string, rIndex: number) => (
                            <li key={rIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                              <BookOpen className="w-4 h-4 mr-2 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Learning Path Timeline */}
      {learningPath && (
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Learning Path</h2>
          </div>
          
          <div className="space-y-6">
            {Object.entries(learningPath).map(([phase, description], index) => {
              const phaseNum = index + 1;
              return (
                <div key={phase} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {phaseNum}
                    </div>
                    {index < Object.keys(learningPath).length - 1 && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-purple-300 to-blue-300 dark:from-purple-700 dark:to-blue-700 mx-auto mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-1">
                      Phase {phaseNum}
                    </h3>
                    <p className="text-gray-900 dark:text-white font-medium text-base">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Next Steps Action Plan */}
      {nextSteps.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Action Plan</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Follow these actionable steps to kickstart your career journey:
          </p>
          
          <div className="space-y-3">
            {nextSteps.map((step: string, index: number) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="flex-1 text-gray-900 dark:text-white font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Market Insights */}
      {marketInsights && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Insights</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {marketInsights.demand && (
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Demand</h3>
                  <p className="text-gray-700 dark:text-gray-300">{marketInsights.demand}</p>
                </div>
              </div>
            )}
            
            {marketInsights.growth && (
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Growth Rate</h3>
                  <p className="text-gray-700 dark:text-gray-300">{marketInsights.growth}</p>
                </div>
              </div>
            )}
            
            {marketInsights.locations && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Top Locations</h3>
                  <p className="text-gray-700 dark:text-gray-300">{marketInsights.locations}</p>
                </div>
              </div>
            )}
            
            {marketInsights.companies && (
              <div className="flex items-start space-x-3">
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Hiring Companies</h3>
                  <p className="text-gray-700 dark:text-gray-300">{marketInsights.companies}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">What's Next?</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
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

      {/* Empty State */}
      {topCareers.length === 0 && nextSteps.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment Completed</h3>
            <p className="text-gray-600 dark:text-gray-400">
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
