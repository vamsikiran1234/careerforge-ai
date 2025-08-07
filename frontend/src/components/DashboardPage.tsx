import React from 'react';
import { useAuthStore } from '@/store/auth';
import { MessageSquare, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

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
      available: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Chat Sessions</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
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
                <p className="text-2xl font-semibold text-gray-900">0</p>
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
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
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
