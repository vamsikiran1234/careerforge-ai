import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Award,
  CheckCircle,
  Zap,
  BarChart3,
  Brain,
  Rocket,
  Play,
  Maximize2,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSEO } from '@/components/common/SEO';
import { MOCK_SCREENSHOTS } from '@/utils/screenshot';

// Animated number counter
const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ 
  end, 
  duration = 2, 
  suffix = '' 
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold">
      {count.toLocaleString()}{suffix}
    </div>
  );
};

// Interactive feature card with hover effects
const FeatureCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}> = ({ icon: Icon, title, description, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-3xl blur opacity-0 group-hover:opacity-30 transition duration-500`} />
      
      {/* Card */}
      <div className="relative p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl hover:border-transparent transition-all duration-300">
        {/* Icon */}
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-transparent bg-gradient-to-r bg-clip-text ${gradient} opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-semibold mr-2">Learn more</span>
          <ArrowRight className="w-4 h-4" style={{ color: 'inherit' }} />
        </div>
      </div>
    </motion.div>
  );
};

// Product screenshot showcase with modal
const ProductShowcase: React.FC<{
  title: string;
  description: string;
  image: string;
  features: string[];
  reverse?: boolean;
}> = ({ title, description, image, features, reverse = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: reverse ? 20 : -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`grid lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}
      >
        {/* Content */}
        <div className={reverse ? 'lg:order-2' : ''}>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            {description}
          </p>
          
          {/* Features list */}
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </motion.li>
            ))}
          </ul>
          
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <span>Try it now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        
        {/* Screenshot */}
        <div className={reverse ? 'lg:order-1' : ''}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative group cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
            
            {/* Screenshot container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
              {/* Browser chrome */}
              <div className="flex items-center space-x-2 px-4 py-3 bg-gray-200 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-1 text-xs text-gray-600 dark:text-gray-400">
                    careerforge.ai
                  </div>
                </div>
              </div>
              
              {/* Actual screenshot */}
              <div className="relative aspect-video">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Full-screen modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={image}
            alt={title}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export const EnterpriseGradeLandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Career Guidance',
      description: 'Get personalized career advice from our advanced AI that learns from your profile, goals, and industry trends.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Smart Career Assessments',
      description: 'Adaptive quizzes that identify your strengths, passions, and ideal career paths with precision.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Users,
      title: 'Expert Mentor Network',
      description: 'Connect 1-on-1 with industry professionals from top companies like Google, Amazon, and Microsoft.',
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      icon: TrendingUp,
      title: 'Career Trajectory Planning',
      description: 'AI-generated roadmaps with milestones, skill requirements, and actionable steps to reach your goals.',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Chat Platform',
      description: '24/7 AI assistant and direct messaging with mentors featuring typing indicators and read receipts.',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track progress with detailed insights, skill development charts, and achievement tracking.',
      gradient: 'from-violet-500 to-purple-600'
    }
  ];

  const showcaseFeatures = [
    {
      title: 'Smart Dashboard',
      description: 'Track your career progress with real-time analytics, personalized recommendations, and actionable insights.',
      image: MOCK_SCREENSHOTS.dashboard,
      features: [
        'Real-time progress tracking with interactive charts',
        'Personalized daily recommendations',
        'Achievement badges and milestones',
        'Skills development overview'
      ]
    },
    {
      title: 'AI Career Chat',
      description: 'Get instant answers to your career questions with our advanced AI assistant trained on industry data.',
      image: MOCK_SCREENSHOTS.chat,
      features: [
        'Natural language understanding',
        'Context-aware responses',
        'Industry-specific advice',
        'Session history and bookmarks'
      ],
      reverse: true
    },
    {
      title: 'Mentor Matching',
      description: 'Find the perfect mentor based on your career goals, industry, and preferred learning style.',
      image: MOCK_SCREENSHOTS.mentors,
      features: [
        'AI-powered compatibility scoring',
        'Filter by expertise and experience',
        'Video session booking',
        'Review and rating system'
      ]
    }
  ];

  const stats = [
    { label: 'Active Users', value: 10000, suffix: '+', icon: Users },
    { label: 'Career Paths', value: 500, suffix: '+', icon: Target },
    { label: 'Expert Mentors', value: 1000, suffix: '+', icon: Award },
    { label: 'Success Rate', value: 94, suffix: '%', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {/* SEO */}
      {createSEO.landing()}
      
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 origin-left z-50"
        style={{ scaleX }}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareerForge AI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Features
              </a>
              <a href="#showcase" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Platform
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
                Reviews
              </a>
              <Link 
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="relative inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold group overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>

            {/* Mobile CTA */}
            <div className="md:hidden">
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg transition-shadow"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-full text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>Powered by GPT-4 & Gemini AI</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Career Platform
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Transform your career with personalized AI guidance, expert mentors, and data-driven insights. Join 10,000+ professionals achieving their goals.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
            >
              <Link
                to="/register"
                className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg font-bold overflow-hidden"
              >
                <span className="relative z-10">Start Free Today</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <a
                href="#showcase"
                className="group inline-flex items-center space-x-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-8 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-lg font-bold"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>See Platform</span>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl mb-3">
                      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-gray-900 dark:text-white mb-1">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid - Bento Style */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <Rocket className="w-4 h-4" />
              <span>Platform Features</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                accelerate your career
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Powerful tools and AI-driven insights designed for modern professionals
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="showcase" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>Platform Screenshots</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
            >
              See the platform
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                in action
              </span>
            </motion.h2>
          </div>

          {/* Showcase Items */}
          <div className="space-y-32">
            {showcaseFeatures.map((feature, index) => (
              <ProductShowcase key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Ready to transform your career?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 mb-10"
          >
            Join thousands of professionals already achieving their goals
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link
              to="/register"
              className="group inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-3xl text-lg font-bold"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 text-lg font-semibold"
            >
              <span>Sign In</span>
            </Link>
          </motion.div>

          <p className="text-blue-100 mt-8 text-sm">
            ✨ No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                CareerForge AI
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">© 2025 CareerForge AI. Built with ❤️ by developers.</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default EnterpriseGradeLandingPage;
