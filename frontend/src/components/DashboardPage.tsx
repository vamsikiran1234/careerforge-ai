import React from 'react';
import { useAuthStore } from '@/store/auth';
import { MessageSquare, BookOpen, Users, TrendingUp, Clock, Award, Target, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { createSEO } from '@/components/common/SEO';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // Mock data for analytics (in real app, this would come from API)
  const progressData = [
    { name: 'Mon', sessions: 2, quizzes: 1 },
    { name: 'Tue', sessions: 3, quizzes: 0 },
    { name: 'Wed', sessions: 1, quizzes: 2 },
    { name: 'Thu', sessions: 4, quizzes: 1 },
    { name: 'Fri', sessions: 2, quizzes: 3 },
    { name: 'Sat', sessions: 1, quizzes: 0 },
    { name: 'Sun', sessions: 0, quizzes: 1 },
  ];

  const skillsData = [
    { name: 'Technical Skills', value: 75, color: '#3B82F6' },
    { name: 'Soft Skills', value: 60, color: '#10B981' },
    { name: 'Leadership', value: 45, color: '#F59E0B' },
    { name: 'Communication', value: 80, color: '#EF4444' },
  ];

  const careerInterests = [
    { name: 'Software Development', value: 85 },
    { name: 'Data Science', value: 70 },
    { name: 'Product Management', value: 55 },
    { name: 'UX Design', value: 40 },
  ];

  const achievements = [
    {
      title: 'First Quiz Completed',
      description: 'Completed your first career assessment',
      icon: Award,
      date: 'Today',
      completed: false,
    },
    {
      title: 'Chat Expert',
      description: 'Had 10 conversations with AI assistant',
      icon: MessageSquare,
      date: '2 days ago',
      completed: false,
    },
    {
      title: 'Profile Complete',
      description: 'Added all profile information',
      icon: Target,
      date: '1 week ago',
      completed: true,
    },
  ];

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {createSEO.dashboard()}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to advance your career? Choose from the options below to get started.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chat Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3 this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Quizzes Taken</p>
                <p className="text-2xl font-semibold text-gray-900">5</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Mentor Connections</p>
                <p className="text-2xl font-semibold text-gray-900">2</p>
                <p className="text-xs text-blue-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  1 upcoming meeting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Progress Score</p>
                <p className="text-2xl font-semibold text-gray-900">78%</p>
                <p className="text-xs text-green-600">Excellent progress!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Your chat sessions and quiz completions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Chat Sessions"
                />
                <Line 
                  type="monotone" 
                  dataKey="quizzes" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Quizzes"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
            <CardDescription>Your current skill levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={skillsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Career Interests & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Career Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Career Interests</CardTitle>
            <CardDescription>Based on your quiz results and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {careerInterests.map((interest, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{interest.name}</span>
                    <span className="text-sm text-gray-500">{interest.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${interest.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Your milestones and accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      achievement.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        achievement.completed ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {achievement.date}
                      </p>
                    </div>
                    {achievement.completed && (
                      <div className="text-green-500">
                        <Award className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const IconComponent = feature.icon;
          
          if (!feature.available) {
            return (
              <Card key={feature.title} className="opacity-50 cursor-not-allowed">
                <CardHeader>
                  <div className="flex items-center">
                    <div className={`${feature.color} p-2 rounded-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          }

          return (
            <Link key={feature.title} to={feature.link}>
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center">
                    <div className={`${feature.color} p-2 rounded-lg`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Available
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Get Started →
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Getting Started Guide */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🚀 Getting Started with CareerForge AI</CardTitle>
          <CardDescription>
            New to CareerForge? Here's how to make the most of your career journey:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">1. Start with AI Chat</h4>
              <p className="text-sm text-gray-600">
                Begin your journey by chatting with our AI assistant. Ask about career paths, 
                skill development, or any career-related questions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">2. Take Career Assessments</h4>
              <p className="text-sm text-gray-600">
                Complete our adaptive quizzes to discover your strengths, interests, 
                and ideal career paths based on your profile.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">3. Connect with Mentors</h4>
              <p className="text-sm text-gray-600">
                Find and connect with industry professionals who can guide you 
                through your career development journey.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">4. Track Your Progress</h4>
              <p className="text-sm text-gray-600">
                Monitor your learning progress, completed assessments, and mentor 
                interactions all from your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
