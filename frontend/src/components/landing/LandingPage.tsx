import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { BrandLogo, CareerForgeMark } from '@/components/ui/BrandLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
  ArrowRight,
  CheckCircle2,
  Users,
  MessageSquare,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  ChevronRight,
  Award,
  Check
} from 'lucide-react';
import { cn } from '@/utils';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [activePreviewTab, setActivePreviewTab] = useState<'quiz' | 'trajectory' | 'mentorship'>('trajectory');

  return (
    <div className="min-h-screen bg-white dark:bg-[#090b11] text-gray-900 dark:text-gray-100 selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Background Architectural Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-[#090b11]/80 border-b border-gray-200/80 dark:border-gray-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <BrandLogo size="md" variant="default" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">How It Works</a>
            <a href="#mentorship" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mentorship</a>
            <a href="#comparison" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Why CareerForge</a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 hidden sm:inline" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Career Guidance Reimagined</span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-gray-600 dark:text-gray-400">Adaptive Sprints & Verified Mentors</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-950 dark:text-white max-w-4xl mx-auto leading-[1.12]">
            From Classroom to Industry Hire.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Forged with Precision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Replace generic lists and repetitive static quizzes with real adaptive skill benchmarking, automated trajectory roadmaps, and 1-on-1 sessions with verified software engineers.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {isAuthenticated ? (
              <Link
                to="/app/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Open Your Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
              >
                <span>Start Free Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-800 rounded-xl transition-all"
            >
              <span>Explore Platform</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span>5-Stage Adaptive Question Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span>Vetted Industry Mentors</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span>No AI Hallucinations</span>
            </div>
          </div>

          {/* Interactive SaaS Product Window Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl shadow-blue-900/10 dark:shadow-black/50 overflow-hidden text-left">
            {/* Window Top Bar */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400/80 dark:bg-red-500/60 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-400/80 dark:bg-yellow-500/60 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-400/80 dark:bg-green-500/60 inline-block" />
                <span className="ml-3 text-xs font-mono text-gray-400 dark:text-gray-500 hidden sm:inline">
                  careerforge.ai/app/career
                </span>
              </div>

              {/* Mockup Tabs */}
              <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-gray-800/80 p-0.5 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('trajectory')}
                  className={cn(
                    'px-3 py-1 rounded-md transition-all',
                    activePreviewTab === 'trajectory'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  Career Trajectory
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('quiz')}
                  className={cn(
                    'px-3 py-1 rounded-md transition-all',
                    activePreviewTab === 'quiz'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  Adaptive Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('mentorship')}
                  className={cn(
                    'px-3 py-1 rounded-md transition-all',
                    activePreviewTab === 'mentorship'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  Verified Mentors
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-950">
              {activePreviewTab === 'trajectory' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          Active Goal
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          AI & Full-Stack Systems Engineer
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Timeline: 6 Months · 5 Structured Milestones · Verified Industry Ready
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Overall Progress: 60%</span>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Visual Node Milestones */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                        <span>STAGE 01 · COMPLETED</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        TypeScript & Full-Stack Core
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Production API design, relational data modeling, and JWT authentication.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 relative shadow-sm">
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                        Current Sprint
                      </span>
                      <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
                        <span>STAGE 02 · IN PROGRESS</span>
                        <Zap className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        RAG Pipelines & Vector Search
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Integrating PostgreSQL pgvector, chunking heuristics, and embedding stores.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 opacity-70">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                        <span>STAGE 03 · UPCOMING</span>
                        <Target className="h-4 w-4" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        Distributed Systems & Scale
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Kafka event streaming, Redis caching layers, and load balancer profiling.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'quiz' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Stage 3 of 5 · System Architecture & Reasoning
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                        Question 3 of 5: Dynamic Difficulty (Adapting to Previous Correct Answers)
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      Difficulty: High
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    When designing a high-throughput recommendation endpoint requiring sub-50ms latency, which strategy best mitigates the vector database similarity search bottleneck?
                  </p>

                  <div className="space-y-2">
                    {[
                      { text: 'A) Execute raw cosine distance scans on every request without indexing', isSelected: false },
                      { text: 'B) Two-tier retrieval: HNSW approximate index in memory followed by quantized reranking', isSelected: true },
                      { text: 'C) Increase relational database thread pool size and convert embeddings to JSON text', isSelected: false },
                      { text: 'D) Perform linear brute-force comparisons on the client browser', isSelected: false },
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-between',
                          opt.isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                            : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        <span>{opt.text}</span>
                        {opt.isSelected && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePreviewTab === 'mentorship' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        Matched Industry Mentors
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Vetted engineers available for mock interviews, code reviews, and roadmap calibration.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      8 Mentors Online
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                          MV
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Marcus Vance</h4>
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Staff AI Platform Engineer</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">PyTorch</span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Distributed AI</span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">System Design</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 text-white font-bold flex items-center justify-center text-sm">
                          SL
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Sarah Lin</h4>
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Lead Full-Stack Architect</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">React Architecture</span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">PostgreSQL</span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Microservices</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: 4 Core Capabilities */}
      <section id="features" className="py-20 md:py-28 bg-gray-50/70 dark:bg-[#0d1017] border-y border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Complete Career Architecture
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white">
              Engineered for Real Industry Competency
            </p>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              Traditional platforms give you static multiple-choice questions or outdated video lectures. CareerForge combines adaptive evaluation with human mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                5-Stage Adaptive Quiz Engine
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Questions that automatically adapt based on your previous answers. Move through 5 distinct stages from fundamentals to system design, isolating exact skill gaps.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-500" />
                  <span>Real-time difficulty adjustment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-500" />
                  <span>Accurate domain aptitude scoring</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Milestone Trajectory Mapping
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate an actionable, sequential career roadmap tailored to your target job role. Track timeline estimates, project deliverables, and real interview requirements.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Interactive node progression graph</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Targeted portfolio project criteria</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-purple-500/50 transition-all shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Verified Industry Mentorship
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Connect directly with practicing software and AI engineers. Schedule 1-on-1 video sessions, conduct mock coding interviews, and receive honest portfolio feedback.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-500" />
                  <span>Vetted company badges & hourly bookings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-purple-500" />
                  <span>Direct mentor chat messaging</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-cyan-500/50 transition-all shadow-xs lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                  Powered by Google Gemini 2.5 Flash
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                AI Career Co-Pilot & Technical Drill Assistant
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                Need to prepare for a system design round tonight? Have questions about whether to pursue data engineering vs. ML infrastructure? Chat anytime with a specialized career intelligence co-pilot trained on modern hiring rubrics.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-blue-200">
                  Ready to benchmark?
                </span>
                <h3 className="text-2xl font-bold mt-2">
                  Test your skills in under 10 minutes.
                </h3>
                <p className="mt-3 text-sm text-blue-100 leading-relaxed">
                  Join thousands of aspiring developers forging structured engineering careers.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
                >
                  <span>Start Free Sprint</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Clear Three-Step Process
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white">
              How CareerForge Bridges the Gap
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <span className="text-4xl font-black text-gray-200 dark:text-gray-800">01</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Benchmark With Adaptive Sprints
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Attempt questions that automatically scale in complexity to identify your exact domain strengths and eliminate blind spots.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <span className="text-4xl font-black text-gray-200 dark:text-gray-800">02</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Follow Your Structured Roadmap
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Execute chronological milestones with tangible code deliverables, portfolio projects, and technical checkpoints.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <span className="text-4xl font-black text-gray-200 dark:text-gray-800">03</span>
              <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                Connect With Verified Mentors
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Book 1-on-1 strategy sessions and mock coding interviews with experienced engineers to validate your hire-readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section id="comparison" className="py-20 md:py-28 bg-gray-50/70 dark:bg-[#0d1017] border-t border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              The Real Difference
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-950 dark:text-white">
              Why CareerForge vs. Generic Tools
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
              <div>Capability</div>
              <div className="text-gray-500">Static Quizzes / Bootcamps</div>
              <div className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1.5">
                <CareerForgeMark size={16} />
                <span>CareerForge AI</span>
              </div>
            </div>

            {[
              {
                feature: 'Assessment Logic',
                traditional: 'Static fixed 10 questions, same for all',
                careerforge: '5-Stage Adaptive Engine (adapts to every answer)',
              },
              {
                feature: 'Domain Recommendations',
                traditional: 'Generic canned results (e.g. always UI/UX)',
                careerforge: 'Close-match scoring based on actual performance',
              },
              {
                feature: 'Career Guidance',
                traditional: 'Unverified forum posts or expensive $15k courses',
                careerforge: 'Verified industry engineers + 24/7 AI Co-Pilot',
              },
              {
                feature: 'Roadmap Tracking',
                traditional: 'Static PDF checklists without verification',
                careerforge: 'Interactive Trajectory Dashboard with live metrics',
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 last:border-0 text-xs sm:text-sm items-center"
              >
                <div className="font-semibold text-gray-900 dark:text-white">{row.feature}</div>
                <div className="text-gray-500 dark:text-gray-400">{row.traditional}</div>
                <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span>{row.careerforge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 bg-white dark:bg-[#090b11]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 mb-6">
            <CareerForgeMark size={40} />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 dark:text-white">
            Start Forging Your Engineering Trajectory Today.
          </h2>
          <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Take the 5-stage adaptive sprint, explore verified tech mentors, and build a career with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Already registered? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800/80 bg-gray-50 dark:bg-gray-950 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" variant="default" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} CareerForge AI. All rights reserved. Adaptive Career Intelligence Platform.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
            <Link to="/login" className="hover:text-gray-900 dark:hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">Register</Link>
            <Link to="/mentorship/register" className="hover:text-gray-900 dark:hover:text-white transition-colors">Become a Mentor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
