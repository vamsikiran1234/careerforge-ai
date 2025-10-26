import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Target, 
  Users, 
  MessageSquare, 
  BookOpen,
  TrendingUp,
  Award,
  CheckCircle,
  Star,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  BarChart3,
  Brain,
  Rocket,
  Menu,
  X,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { createSEO } from '@/components/common/SEO';

// Magnetic Button Component
const MagneticButton: React.FC<{ children: React.ReactNode; className?: string; to?: string }> = ({ children, className, to }) => {
  const ref = React.useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (to) {
    return (
      <Link
        to={to}
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'transform 0.2s ease-out'
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.2s ease-out'
      }}
    >
      {children}
    </a>
  );
};

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: string; duration?: number }> = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInView) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;

    // Extract number from value string (e.g., "10K+" -> 10000)
    const numericValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const multiplier = value.includes('K') ? 1000 : 1;
    const targetValue = numericValue * multiplier;
    
    const increment = targetValue / (duration * 60); // 60 FPS
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  // Format the count back to display format
  const formatCount = (num: number) => {
    if (value.includes('K')) {
      return `${(num / 1000).toFixed(num >= 1000 ? 1 : 0)}K${value.includes('+') ? '+' : ''}`;
    }
    if (value.includes('%')) {
      return `${num}%`;
    }
    return `${num}${value.includes('+') ? '+' : ''}`;
  };

  return <div ref={ref}>{isInView ? formatCount(count) : value}</div>;
};

export const LandingPage: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Career Guidance',
      description: 'Get personalized career advice from our advanced AI assistant that understands your unique goals and background.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Target,
      title: 'Smart Career Assessments',
      description: 'Take adaptive quizzes that identify your strengths, interests, and ideal career paths with precision.',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Expert Mentor Network',
      description: 'Connect with industry professionals who can guide your career development with real-world insights.',
      color: 'from-cyan-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      title: 'Career Trajectory Planning',
      description: 'Map your career journey with AI-generated milestones and actionable steps to reach your goals.',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      icon: MessageSquare,
      title: 'Real-Time Chat Support',
      description: '24/7 access to AI-powered career conversations and direct messaging with your mentors.',
      color: 'from-teal-600 to-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Track your career development with detailed analytics, insights, and personalized recommendations.',
      color: 'from-cyan-600 to-emerald-600'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Career Paths', value: '500+', icon: Target },
    { label: 'Expert Mentors', value: '1,000+', icon: Award },
    { label: 'Success Rate', value: '94%', icon: TrendingUp }
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Create Your Profile',
      description: 'Sign up in seconds and tell us about your career goals, skills, and aspirations.',
      icon: Users
    },
    {
      step: '02',
      title: 'Take Career Assessments',
      description: 'Complete adaptive quizzes to discover your ideal career paths and identify skill gaps.',
      icon: BookOpen
    },
    {
      step: '03',
      title: 'Connect with Mentors',
      description: 'Get matched with experienced professionals who can guide your career journey.',
      icon: MessageSquare
    },
    {
      step: '04',
      title: 'Track Your Progress',
      description: 'Monitor your development with detailed analytics and achieve your career milestones.',
      icon: TrendingUp
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      image: '👩‍💻',
      quote: 'CareerForge AI helped me transition from marketing to software engineering. The AI guidance was spot-on, and my mentor was invaluable!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager at Microsoft',
      image: '👨‍💼',
      quote: 'The career assessments revealed strengths I didn\'t know I had. Now I\'m thriving in a role I love. Best career decision ever!',
      rating: 5
    },
    {
      name: 'Priya Sharma',
      role: 'Data Scientist at Amazon',
      image: '👩‍🔬',
      quote: 'The AI-powered recommendations were incredibly accurate. Within 6 months, I landed my dream job with a 40% salary increase.',
      rating: 5
    }
  ];

  const benefits = [
    { text: 'AI-powered career recommendations', icon: Sparkles },
    { text: 'Access to 1,000+ industry mentors', icon: Users },
    { text: 'Adaptive skill assessments', icon: Target },
    { text: 'Real-time progress tracking', icon: BarChart3 },
    { text: 'Personalized learning paths', icon: BookOpen },
    { text: '24/7 AI chat support', icon: MessageSquare }
  ];

  const faqs = [
    {
      question: 'How does CareerForge AI work?',
      answer: 'CareerForge AI uses advanced machine learning algorithms to analyze your skills, experience, and career goals. It provides personalized recommendations, connects you with expert mentors, and offers adaptive assessments to guide your career development journey.'
    },
    {
      question: 'Is CareerForge AI free to use?',
      answer: 'Yes! We offer a free tier that includes basic AI career guidance, limited mentor connections, and access to career assessments. Premium plans unlock advanced features like unlimited mentor sessions, priority support, and detailed analytics.'
    },
    {
      question: 'How are mentors selected and verified?',
      answer: 'All mentors go through a rigorous verification process. We verify their professional credentials, work history, and expertise. Mentors are matched based on your industry, career goals, and specific needs to ensure the best possible guidance.'
    },
    {
      question: 'Can I switch mentors if needed?',
      answer: 'Absolutely! We understand that finding the right mentor fit is important. You can request a mentor change at any time, and our AI will help match you with alternative mentors who better align with your goals and preferences.'
    },
    {
      question: 'What types of careers does CareerForge AI support?',
      answer: 'CareerForge AI supports over 500 career paths across various industries including Technology, Business, Healthcare, Creative Arts, Engineering, Marketing, Finance, and more. Our AI continuously learns and expands to cover emerging career opportunities.'
    },
    {
      question: 'How long does it take to see results?',
      answer: 'Many users report noticeable improvements in career clarity within the first week. Typical outcomes like landing interviews or promotions occur within 3-6 months, depending on your goals, effort, and market conditions. Our platform provides real-time progress tracking to keep you motivated.'
    }
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* SEO Metadata */}
      {createSEO.landing()}
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                CareerForge AI
              </span>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">
                How It Works
              </a>
              <a href="#testimonials" className="text-slate-300 hover:text-emerald-400 transition-colors font-medium">
                Testimonials
              </a>
              <Link 
                to="/login"
                className="text-slate-300 hover:text-emerald-400 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center space-x-2 font-semibold"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
              <Link
                to="/register"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-xl text-sm flex items-center space-x-1 shadow-lg shadow-emerald-500/20"
              >
                <span>Start</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-emerald-400 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-emerald-400 transition-colors text-lg font-medium py-2"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-emerald-400 transition-colors text-lg font-medium py-2"
              >
                How It Works
              </a>
              <a 
                href="#testimonials" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-emerald-400 transition-colors text-lg font-medium py-2"
              >
                Testimonials
              </a>
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-emerald-400 transition-colors text-lg font-medium py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg text-center font-semibold"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pb-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          />
          <div 
            className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
            style={{ transform: `translateY(${scrollY * -0.3}px)` }}
          />
          <div 
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"
            style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.2}px)` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content (60%) */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
                <Zap className="w-4 h-4" />
                <span>Powered by Advanced AI Technology</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
                Your AI-Powered Career
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Success Platform
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed animate-fade-in-up animation-delay-200">
                Get personalized career guidance, connect with expert mentors, and achieve your professional goals with AI-powered insights.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-12 animate-fade-in-up animation-delay-400">
                <Link
                  to="/register"
                  className="group bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center space-x-2 text-lg font-semibold w-full sm:w-auto justify-center"
                >
                  <span>Start Free Today</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#how-it-works"
                  className="bg-slate-800/50 backdrop-blur-sm text-white px-8 py-4 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-200 flex items-center space-x-2 text-lg font-semibold w-full sm:w-auto justify-center"
                >
                  <span>See How It Works</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              {/* Stats - Mobile Only (Below Buttons) */}
              <div className="grid grid-cols-2 gap-6 lg:hidden animate-fade-in-up animation-delay-600">
                {stats.slice(0, 2).map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg mb-2">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">
                        <AnimatedCounter value={stat.value} />
                      </div>
                      <div className="text-xs text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Dashboard Preview (40%) */}
            <div className="relative hidden lg:block animate-fade-in-up animation-delay-400">
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-slate-700/50">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Career Dashboard</h3>
                      <p className="text-xs text-slate-400">Your progress overview</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-400">Live</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-slate-400">Chat Sessions</span>
                      </div>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs text-slate-400">Quizzes</span>
                      </div>
                      <p className="text-2xl font-bold text-white">8</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-300">Career Progress</span>
                      <span className="text-xs font-bold text-emerald-400">78%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full shadow-lg shadow-emerald-500/50" style={{ width: '78%' }}></div>
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <p className="text-xs font-medium text-slate-300 mb-3">Weekly Activity</p>
                    <div className="flex items-end justify-between h-20 gap-2">
                      {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-500 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating Achievement Badge */}
                <div className="absolute -top-4 -right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-amber-500/30 animate-bounce">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>

                {/* Floating Mentor Card */}
                <div className="absolute -bottom-4 -left-4 bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl p-3 border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      JD
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">New Mentor Match!</p>
                      <p className="text-xs text-slate-400">John Doe</p>
                    </div>
                  </div>
                </div>

                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl blur-3xl -z-10"></div>
              </div>
            </div>
          </div>

          {/* Stats - Desktop Only (Below Hero) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="hidden lg:grid grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div key={index} variants={fadeInUp} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-sm text-slate-400">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Trust Signals Section */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-slate-400 mb-4">
              TRUSTED BY PROFESSIONALS WORLDWIDE
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mb-12">
            {/* Company Placeholders - Replace with real logos */}
            {['Google', 'Microsoft', 'Amazon', 'Meta'].map((company, i) => (
              <div key={i} className="flex items-center justify-center h-12 w-32 text-slate-500 hover:text-emerald-400 font-bold text-lg transition-colors">
                {company}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <p className="text-2xl font-bold text-white">10,000+</p>
              </div>
              <p className="text-sm text-slate-400">Active Users</p>
            </div>
            <div className="text-center p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-400" />
                <p className="text-2xl font-bold text-white">4.9/5</p>
              </div>
              <p className="text-sm text-slate-400">Average Rating</p>
            </div>
            <div className="text-center p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-teal-400" />
                <p className="text-2xl font-bold text-white">5,000+</p>
              </div>
              <p className="text-sm text-slate-400">Success Stories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 lg:py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Rocket className="w-4 h-4" />
              <span>Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                succeed in your career
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Powerful tools and features designed to accelerate your career growth
            </p>
          </motion.div>

          {/* Bento Grid Layout */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 auto-rows-fr"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              // Define bento grid spans for varied layout
              const gridSpans = [
                'lg:col-span-2 lg:row-span-2', // AI Career Guidance - Large
                'lg:col-span-2 lg:row-span-1', // Personalized Assessments - Wide
                'lg:col-span-2 lg:row-span-1', // Expert Mentorship - Wide
                'lg:col-span-2 lg:row-span-1', // Real-time Chat - Wide
                'lg:col-span-2 lg:row-span-1', // Progress Analytics - Wide
                'lg:col-span-2 lg:row-span-2', // Community Support - Large
              ];
              
              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`group p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 border border-slate-700/50 hover:border-emerald-500/50 ${gridSpans[index] || 'lg:col-span-2'}`}
                >
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                  {/* Featured badge for large cards */}
                  {(index === 0 || index === 5) && (
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Get started in
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                four simple steps
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals who transformed their careers with CareerForge AI
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {howItWorks.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                  )}
                  
                  <div className="relative bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 border border-slate-700/50 hover:border-emerald-500/50">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/50">
                      {step.step}
                    </div>
                    
                    <div className="mt-4">
                      <Icon className="w-12 h-12 text-emerald-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits List */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                <span>Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                The most advanced
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  career platform
                </span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
                Join the fastest-growing career development community and unlock your full potential.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-slate-800/30 rounded-xl hover:shadow-md hover:shadow-emerald-500/10 transition-all border border-slate-700/30 hover:border-emerald-500/30">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white font-medium">
                        {benefit.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/register"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 mt-8 font-semibold"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 shadow-2xl shadow-emerald-500/20">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                      <span className="text-white font-semibold">Career Score</span>
                      <span className="text-white text-2xl font-bold">94%</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                      <span className="text-white font-semibold">Skills Mastered</span>
                      <span className="text-white text-2xl font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                      <span className="text-white font-semibold">Mentor Sessions</span>
                      <span className="text-white text-2xl font-bold">8</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                      <span className="text-white font-semibold">Goals Achieved</span>
                      <span className="text-white text-2xl font-bold">5/7</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/50 animate-bounce">
                <Award className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/50 animate-pulse">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 lg:py-32 bg-slate-900/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              <span>Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Loved by professionals
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                around the world
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Hear from our community members who transformed their careers
            </p>
          </motion.div>

          {/* Testimonials Marquee */}
          <div className="relative">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -100 * testimonials.length]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear"
                }
              }}
            >
              {/* Duplicate testimonials for seamless loop */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="flex-shrink-0 w-[350px] bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-slate-700/50 hover:border-emerald-500/30 transition-all"
                >
                  {/* Stars */}
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/50">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-bold text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Gradient Overlays */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-900/50 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900/50 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 lg:py-32 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <MessageSquare className="w-4 h-4" />
              <span>FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Frequently asked
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
              Everything you need to know about CareerForge AI
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-emerald-500/30 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
                >
                  <span className="font-semibold text-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="w-5 h-5 text-emerald-400 transform rotate-90" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openFaqIndex === index ? 'auto' : 0,
                    opacity: openFaqIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-slate-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-r from-emerald-600 to-teal-600 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to transform your career?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
            Join thousands of professionals who are already achieving their career goals
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <MagneticButton
              to="/register"
              className="group bg-white text-emerald-600 px-8 py-4 rounded-xl hover:bg-slate-50 transition-all duration-200 shadow-xl shadow-white/25 hover:shadow-2xl hover:shadow-white/40 flex items-center space-x-2 text-lg font-bold"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
            <MagneticButton
              to="/login"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-200 flex items-center space-x-2 text-lg font-semibold"
            >
              <span>Sign In</span>
            </MagneticButton>
          </div>

          <p className="text-white/80 mt-6 text-sm">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  CareerForge AI
                </span>
              </div>
              <p className="text-slate-400 mb-4">
                The most advanced AI-powered career development platform. Transform your professional journey with personalized guidance.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-emerald-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2">
                <li><Link to="/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
                <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © 2025 CareerForge AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm">Built with ❤️ by developers</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
