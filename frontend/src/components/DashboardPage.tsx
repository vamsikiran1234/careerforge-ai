import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { MessageSquare, BookOpen, Users, TrendingUp, Clock, Award, Target, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createSEO } from '@/components/common/SEO';
import { apiClient } from '@/lib/api-client';
import { motion } from 'framer-motion';
import { fadeVariants, listVariants, listItemVariants } from '@/utils/animations';
import { SkeletonDashboardStat, SkeletonCard } from '@/components/ui/LoadingSkeletons';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  quickStats: {
    chatSessions: {
      total: number;
      thisWeek: number;
    };
    quizzesTaken: {
      total: number;
      thisWeek: number;
    };
    mentorConnections: {
      total: number;
      upcomingMeetings: number;
    };
    progressScore: number;
  };
  weeklyActivity: Array<{
    name: string;
    sessions: number;
    quizzes: number;
  }>;
  careerInterests: Array<{
    name: string;
    value: number;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    date: string;
    completed: boolean;
  }>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // apiClient.get returns response.data directly (not the full axios response)
        // Backend returns: { success: boolean, data: DashboardStats }
        const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
        
        // Debug logging
        console.log('🔍 Dashboard API Response:', response);
        console.log('🔍 Success:', response?.success);
        console.log('🔍 Stats Data:', response?.data);
        
        if (response?.success && response?.data) {
          console.log('✅ Setting stats with real data');
          setStats(response.data);
        } else {
          console.error('❌ Response structure issue:', {
            hasResponse: !!response,
            hasSuccess: !!response?.success,
            hasDataField: !!response?.data,
            actualStructure: response
          });
          setError('Failed to load dashboard data');
        }
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error('❌ Error fetching dashboard stats:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unable to load dashboard statistics';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Default data while loading
  const defaultData = {
    quickStats: {
      chatSessions: { total: 0, thisWeek: 0 },
      quizzesTaken: { total: 0, thisWeek: 0 },
      mentorConnections: { total: 0, upcomingMeetings: 0 },
      progressScore: 0
    },
    weeklyActivity: [
      { name: 'Mon', sessions: 0, quizzes: 0 },
      { name: 'Tue', sessions: 0, quizzes: 0 },
      { name: 'Wed', sessions: 0, quizzes: 0 },
      { name: 'Thu', sessions: 0, quizzes: 0 },
      { name: 'Fri', sessions: 0, quizzes: 0 },
      { name: 'Sat', sessions: 0, quizzes: 0 },
      { name: 'Sun', sessions: 0, quizzes: 0 },
    ],
    careerInterests: [
      { name: 'Take a quiz to discover', value: 0 }
    ],
    achievements: [
      { title: 'First Quiz', description: 'Complete your first assessment', icon: 'Award', date: 'Pending', completed: false },
      { title: 'Chat Expert', description: 'Have 10 conversations', icon: 'MessageSquare', date: 'Pending', completed: false },
      { title: 'Profile Complete', description: 'All info added', icon: 'Target', date: 'Completed', completed: true }
    ]
  };

  const currentData = stats || defaultData;

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, typeof MessageSquare> = {
      Award,
      MessageSquare,
      Target,
      Users
    };
    return icons[iconName] || Award;
  };

  // Helper to format progress message
  const getProgressMessage = () => {
    if (loading) return 'Loading your progress...';
    if (error) return 'Unable to calculate progress';
    const score = currentData.quickStats.progressScore;
    if (score >= 80) return 'Excellent progress!';
    if (score >= 60) return 'Great work!';
    if (score >= 40) return 'Keep going!';
    if (score >= 20) return 'Good start!';
    return 'Start your journey!';
  };

  const features = [
    {
      title: 'AI Career Chat',
      description: 'Get personalized career guidance from our AI assistant',
      icon: MessageSquare,
      link: '/chat',
      color: 'bg-blue-500',
      available: true,
    },
    {
      title: 'Career Quiz',
      description: 'Take adaptive assessments to discover your career path',
      icon: BookOpen,
      link: '/quiz',
      color: 'bg-green-500',
      available: true,
    },
    {
      title: 'Find Mentors',
      description: 'Connect with industry experts and mentors',
      icon: Users,
      link: '/mentors',
      color: 'bg-purple-500',
      available: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {createSEO.dashboard()}
      
      {/* Header */}
      <motion.div 
        className="space-y-2"
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to advance your career? Choose from the options below to get started.
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div 
          className="alert-warning"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <p className="text-sm flex-1">
              {error}. Showing placeholder data.
            </p>
          </div>
        </motion.div>
      )}

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonDashboardStat key={i} />
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={listItemVariants}>
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Chat Sessions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {currentData.quickStats.chatSessions.total}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-success-600 dark:text-success-400">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{currentData.quickStats.chatSessions.thisWeek} this week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-success-100 dark:bg-success-900/30 rounded-xl">
                    <BookOpen className="h-6 w-6 text-success-600 dark:text-success-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Quizzes Taken
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {currentData.quickStats.quizzesTaken.total}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-success-600 dark:text-success-400">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{currentData.quickStats.quizzesTaken.thisWeek} this week
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mentor Connections
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {currentData.quickStats.mentorConnections.total}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-info-600 dark:text-info-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {currentData.quickStats.mentorConnections.upcomingMeetings} upcoming
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={listItemVariants}>
            <Card className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 p-3 bg-warning-100 dark:bg-warning-900/30 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Progress Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {currentData.quickStats.progressScore}%
                    </p>
                    <p className="text-xs text-success-600 dark:text-success-400 mt-2">
                      {getProgressMessage()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Analytics Section */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your chat sessions and quiz completions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={currentData.weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      stroke="#9CA3AF"
                    />
                    <YAxis 
                      className="text-xs"
                      stroke="#9CA3AF"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quizzes" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions & Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Recommended Next Steps
                </CardTitle>
                <CardDescription>Actions to advance your career journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentData.quickStats.chatSessions.total === 0 && (
                    <Link to="/chat" className="block group">
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Start Your First Career Chat</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Get AI-powered career guidance</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  )}
                  
                  {currentData.quickStats.quizzesTaken.total === 0 && (
                    <Link to="/quiz" className="block group">
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Take Career Assessment Quiz</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Discover your ideal career path</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  )}
                  
                  {currentData.quickStats.mentorConnections.total === 0 && (
                    <Link to="/mentors" className="block group">
                      <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Find Your First Mentor</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Connect with industry experts</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  )}
                  
                  {currentData.quickStats.chatSessions.total > 0 && 
                   currentData.quickStats.quizzesTaken.total > 0 && 
                   currentData.quickStats.mentorConnections.total > 0 && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 mb-4">
                        <Award className="h-8 w-8 text-success-600 dark:text-success-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">You're All Set! 🎉</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Keep engaging with mentors and exploring career opportunities
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Career Interests & Recent Achievements */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Career Interests */}
          <motion.div variants={listItemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Career Interests</CardTitle>
                <CardDescription>Based on your quiz results and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentData.careerInterests.map((interest: { name: string; value: number }, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{interest.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{interest.value}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${interest.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Achievements */}
          <motion.div variants={listItemVariants}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
                <CardDescription>Your milestones and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentData.achievements.map((achievement: { title: string; description: string; icon: string; date: string; completed: boolean }, index: number) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className={`flex-shrink-0 p-2.5 rounded-xl ${
                          achievement.completed 
                            ? 'bg-success-100 dark:bg-success-900/30' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <IconComponent className={`h-5 w-5 ${
                            achievement.completed 
                              ? 'text-success-600 dark:text-success-400' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {achievement.title}
                            </h4>
                            {achievement.completed && (
                              <Award className="h-4 w-4 flex-shrink-0 text-success-500 dark:text-success-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {achievement.date}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Features Grid */}
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
  ) : (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={listVariants}
      initial="hidden"
      animate="visible"
    >
        {features.map((feature) => {
          const IconComponent = feature.icon;
          
          if (!feature.available) {
            return (
              <motion.div key={feature.title} variants={listItemVariants}>
                <Card className="opacity-50 cursor-not-allowed h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`${feature.color} p-3 rounded-xl`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <span className="inline-flex items-center text-xs bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-400 px-2.5 py-1 rounded-full mt-1">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          }

          return (
            <motion.div key={feature.title} variants={listItemVariants}>
              <Link to={feature.link} className="group block">
                <Card className="card-interactive h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`${feature.color} p-3 rounded-xl`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <span className="inline-flex items-center text-xs bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-400 px-2.5 py-1 rounded-full mt-1">
                          Available
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-info-600 dark:text-info-400 group-hover:gap-3 transition-all">
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    )}

    {/* Getting Started Guide */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>🚀 Getting Started with CareerForge AI</CardTitle>
          <CardDescription>
            New to CareerForge? Here's how to make the most of your career journey:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Start with AI Chat</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Begin your journey by chatting with our AI assistant. Ask about career paths, 
                skill development, or any career-related questions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. Take Career Assessments</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Complete our adaptive quizzes to discover your strengths, interests, 
                and ideal career paths based on your profile.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. Connect with Mentors</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find and connect with industry professionals who can guide you 
                through your career development journey.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">4. Track Your Progress</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor your learning progress, completed assessments, and mentor 
                interactions all from your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);
};
