import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStore } from '../../store/quiz';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/Loading';
import { 
  ChevronRight, 
  Target, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  Compass, 
  Sparkles, 
  BookOpen, 
  Zap, 
  Play, 
  Pause, 
  ArrowRight
} from 'lucide-react';

interface QuizInterfaceProps {
  onComplete: () => void;
}

// Stage configuration definition with distinct theme colors and tailored micro-insights
interface StageConfig {
  key: string;
  name: string;
  shortName: string;
  stageNumber: number;
  icon: React.ElementType;
  description: string;
  colorScheme: {
    badge: string;
    text: string;
    textDark: string;
    bgSubtle: string;
    border: string;
    borderSelected: string;
    bgSelected: string;
    gradient: string;
    glow: string;
    ring: string;
  };
  aiInsight: string;
  nextTeaser: string;
}

const STAGE_CONFIGS: Record<string, StageConfig> = {
  SKILLS_ASSESSMENT: {
    key: 'SKILLS_ASSESSMENT',
    name: 'Skills Assessment',
    shortName: 'Skills',
    stageNumber: 1,
    icon: Terminal,
    description: 'Technical abilities, languages, debugging & software craftsmanship',
    colorScheme: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      text: 'text-blue-600',
      textDark: 'dark:text-blue-400',
      bgSubtle: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      borderSelected: 'border-blue-500',
      bgSelected: 'bg-blue-50/80 dark:bg-blue-950/30',
      gradient: 'from-blue-600 to-indigo-600',
      glow: 'shadow-blue-500/20',
      ring: 'focus:ring-blue-500',
    },
    aiInsight: 'Technical profile captured: Analyzed your core programming stack, database modeling, and debugging practices.',
    nextTeaser: 'Stage 2: Career Interests — 5 quick questions exploring the real-world products, industries, and tech trends that excite you most.',
  },
  CAREER_INTERESTS: {
    key: 'CAREER_INTERESTS',
    name: 'Career Interests',
    shortName: 'Interests',
    stageNumber: 2,
    icon: Compass,
    description: 'Project preferences, industry domains & what excites you',
    colorScheme: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      text: 'text-purple-600',
      textDark: 'dark:text-purple-400',
      bgSubtle: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      borderSelected: 'border-purple-500',
      bgSelected: 'bg-purple-50/80 dark:bg-purple-950/30',
      gradient: 'from-purple-600 to-fuchsia-600',
      glow: 'shadow-purple-500/20',
      ring: 'focus:ring-purple-500',
    },
    aiInsight: 'Domain affinity mapped: Captured your favorite software architectures, high-growth industries, and weekend build ambitions.',
    nextTeaser: 'Stage 3: Personality Traits — 5 quick questions to understand your team collaboration rhythm and deadline problem-solving style.',
  },
  PERSONALITY_TRAITS: {
    key: 'PERSONALITY_TRAITS',
    name: 'Personality Traits',
    shortName: 'Personality',
    stageNumber: 3,
    icon: Sparkles,
    description: 'Collaboration rhythm, problem-solving style & team dynamics',
    colorScheme: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-600',
      textDark: 'dark:text-emerald-400',
      bgSubtle: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      borderSelected: 'border-emerald-500',
      bgSelected: 'bg-emerald-50/80 dark:bg-emerald-950/30',
      gradient: 'from-emerald-600 to-teal-600',
      glow: 'shadow-emerald-500/20',
      ring: 'focus:ring-emerald-500',
    },
    aiInsight: 'Workplace dynamic synthesized: Identified your feedback adaptability, high-pressure execution habits, and natural team strengths.',
    nextTeaser: 'Stage 4: Learning Style — 5 quick questions to tailor your learning curve and mentorship requirements.',
  },
  LEARNING_STYLE: {
    key: 'LEARNING_STYLE',
    name: 'Learning Style',
    shortName: 'Learning',
    stageNumber: 4,
    icon: BookOpen,
    description: 'Upskilling habits, retention methods & mentorship preferences',
    colorScheme: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      text: 'text-amber-600',
      textDark: 'dark:text-amber-400',
      bgSubtle: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      borderSelected: 'border-amber-500',
      bgSelected: 'bg-amber-50/80 dark:bg-amber-950/30',
      gradient: 'from-amber-600 to-orange-600',
      glow: 'shadow-amber-500/20',
      ring: 'focus:ring-amber-500',
    },
    aiInsight: 'Learning velocity profiled: Captured your practical study resources, retention techniques, and specific mentorship needs.',
    nextTeaser: 'Stage 5: Career Goals — The final sprint! 5 questions defining your target job roles, milestone obstacles, and 3-year vision.',
  },
  CAREER_GOALS: {
    key: 'CAREER_GOALS',
    name: 'Career Goals',
    shortName: 'Goals',
    stageNumber: 5,
    icon: Target,
    description: 'Target roles, career milestones & 3-year vision',
    colorScheme: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      text: 'text-rose-600',
      textDark: 'dark:text-rose-400',
      bgSubtle: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      borderSelected: 'border-rose-500',
      bgSelected: 'bg-rose-50/80 dark:bg-rose-950/30',
      gradient: 'from-rose-600 to-pink-600',
      glow: 'shadow-rose-500/20',
      ring: 'focus:ring-rose-500',
    },
    aiInsight: 'Career trajectory finalized: All 25 responses synthesized into your personalized Career Matrix recommendations!',
    nextTeaser: 'Generating your comprehensive career analysis...',
  },
};

const STAGE_ORDER = [
  'SKILLS_ASSESSMENT',
  'CAREER_INTERESTS',
  'PERSONALITY_TRAITS',
  'LEARNING_STYLE',
  'CAREER_GOALS',
];

interface StageTransitionData {
  completedStageNumber: number;
  completedStageName: string;
  completedStageKey: string;
  nextStageNumber: number;
  nextStageName: string;
  nextStageKey: string;
  insight: string;
  nextTeaser: string;
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

  // Stage transition milestone modal state
  const [showStageTransition, setShowStageTransition] = useState(false);
  const [stageTransitionData, setStageTransitionData] = useState<StageTransitionData | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [isCountdownPaused, setIsCountdownPaused] = useState(false);

  // Ref to track stage progression
  const stageCountdownTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Stage configuration helper
  const getStageConfig = (stageKey?: string): StageConfig => {
    if (!stageKey) return STAGE_CONFIGS.SKILLS_ASSESSMENT;
    // Handle potential legacy aliases
    const normalizedKey = stageKey === 'INTERESTS_ASSESSMENT' ? 'CAREER_INTERESTS'
      : stageKey === 'PERSONALITY_ASSESSMENT' ? 'PERSONALITY_TRAITS'
      : stageKey === 'VALUES_ASSESSMENT' ? 'LEARNING_STYLE'
      : stageKey === 'GOALS_ASSESSMENT' ? 'CAREER_GOALS'
      : stageKey;

    return STAGE_CONFIGS[normalizedKey] || STAGE_CONFIGS.SKILLS_ASSESSMENT;
  };

  const currentStageConfig = useMemo(() => {
    return getStageConfig(currentSession?.currentStage);
  }, [currentSession?.currentStage]);

  // Per-stage question calculation (always 1 to 5)
  const sprintProgress = useMemo(() => {
    if (!currentSession?.progress) {
      return { stageQuestion: 1, stageTotal: 5, currentStage: 1, totalStages: 5, overallQuestion: 1, overallTotal: 25 };
    }
    const { progress } = currentSession;
    const overallQuestion = progress.currentQuestion || 1;
    const overallTotal = progress.totalQuestions || 25;
    const stageQuestion = progress.stageQuestion || (((overallQuestion - 1) % 5) + 1);
    const stageTotal = progress.stageTotalQuestions || 5;
    const currentStage = progress.currentStage || 1;
    const totalStages = progress.totalStages || 5;

    return {
      stageQuestion: Math.min(Math.max(stageQuestion, 1), 5),
      stageTotal: Math.max(stageTotal, 1),
      currentStage: Math.min(Math.max(currentStage, 1), 5),
      totalStages: Math.max(totalStages, 1),
      overallQuestion,
      overallTotal,
    };
  }, [currentSession?.progress]);

  // Handle countdown timer for stage transition modal
  useEffect(() => {
    if (showStageTransition && !isCountdownPaused) {
      if (countdownSeconds > 0) {
        stageCountdownTimerRef.current = setTimeout(() => {
          setCountdownSeconds(prev => prev - 1);
        }, 1000);
      } else {
        // Countdown expired, auto-advance
        handleDismissTransition();
      }
    }

    return () => {
      if (stageCountdownTimerRef.current) {
        clearTimeout(stageCountdownTimerRef.current);
      }
    };
  }, [showStageTransition, countdownSeconds, isCountdownPaused]);

  const handleDismissTransition = () => {
    if (stageCountdownTimerRef.current) {
      clearTimeout(stageCountdownTimerRef.current);
    }
    setShowStageTransition(false);
    setStageTransitionData(null);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentSession || isSubmitting) return;

    const currentStageNum = sprintProgress.currentStage;
    const currentSprintQ = sprintProgress.stageQuestion;
    const isStageLastQuestion = currentSprintQ === 5 && currentStageNum < 5;
    const prevStageKey = currentSession.currentStage;

    setIsSubmitting(true);
    try {
      await submitAnswer(
        currentSession.sessionId, 
        selectedAnswer, 
        currentSession.question.id
      );
      setSelectedAnswer('');

      // If this answer completes the 5th question of the stage, trigger the milestone card!
      if (isStageLastQuestion) {
        const completedConfig = getStageConfig(prevStageKey);
        const nextStageKey = STAGE_ORDER[currentStageNum] || 'CAREER_GOALS';
        const nextConfig = getStageConfig(nextStageKey);

        setStageTransitionData({
          completedStageNumber: currentStageNum,
          completedStageName: completedConfig.name,
          completedStageKey: prevStageKey,
          nextStageNumber: currentStageNum + 1,
          nextStageName: nextConfig.name,
          nextStageKey: nextStageKey,
          insight: completedConfig.aiInsight,
          nextTeaser: completedConfig.nextTeaser,
        });
        setCountdownSeconds(5);
        setIsCountdownPaused(false);
        setShowStageTransition(true);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard shortcut listener (1-4, A-D, and Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showStageTransition || isSubmitting || !currentSession?.question?.options) return;

      const key = e.key.toLowerCase();
      const options = currentSession.question.options;

      if ((key === '1' || key === 'a') && options[0]) {
        setSelectedAnswer(options[0]);
      } else if ((key === '2' || key === 'b') && options[1]) {
        setSelectedAnswer(options[1]);
      } else if ((key === '3' || key === 'c') && options[2]) {
        setSelectedAnswer(options[2]);
      } else if ((key === '4' || key === 'd') && options[3]) {
        setSelectedAnswer(options[3]);
      } else if (key === 'enter' && selectedAnswer) {
        e.preventDefault();
        handleSubmitAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnswer, currentSession, showStageTransition, isSubmitting]);

  if (!currentSession) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-8 text-center border-dashed border-gray-300 dark:border-zinc-800">
          <p className="text-gray-600 dark:text-zinc-400 font-medium">No active quiz session found.</p>
        </Card>
      </div>
    );
  }

  const { question } = currentSession;

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-8 text-center space-y-4 shadow-xl border-gray-200 dark:border-zinc-800">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-zinc-400 font-medium">Preparing your personalized questions...</p>
        </Card>
      </div>
    );
  }

  const StageIcon = currentStageConfig.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 relative animate-fade-in">

      {/* =========================================================================
          1. 5-SEGMENT INTERACTIVE STAGE STEPPER (Top Banner)
         ========================================================================= */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {STAGE_ORDER.map((stageKey, idx) => {
            const config = STAGE_CONFIGS[stageKey];
            const StepIcon = config.icon;
            const stageNum = idx + 1;
            const isCompleted = stageNum < sprintProgress.currentStage;
            const isActive = stageNum === sprintProgress.currentStage;

            return (
              <div 
                key={stageKey}
                className={`relative flex flex-col items-center text-center p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-b from-gray-50 to-white dark:from-zinc-800/90 dark:to-zinc-800/40 border-2 shadow-sm ' + config.colorScheme.borderSelected
                    : isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-300/40 dark:border-emerald-700/40'
                    : 'bg-gray-50/60 dark:bg-zinc-900/40 border border-transparent opacity-60'
                }`}
              >
                {/* Stage Icon / Checkmark */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-1.5 transition-transform duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${config.colorScheme.gradient} text-white shadow-md scale-105`
                    : isCompleted
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  )}
                </div>

                {/* Stage Short Name */}
                <span className={`text-xs font-semibold tracking-tight truncate w-full ${
                  isActive 
                    ? 'text-gray-900 dark:text-white font-bold'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-zinc-500'
                }`}>
                  {config.shortName}
                </span>

                {/* Stage Status / Micro Progress */}
                <div className="w-full mt-1.5 hidden sm:block">
                  {isActive ? (
                    <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${config.colorScheme.gradient} transition-all duration-300`}
                        style={{ width: `${(sprintProgress.stageQuestion / 5) * 100}%` }}
                      />
                    </div>
                  ) : isCompleted ? (
                    <div className="w-full bg-emerald-500 h-1 rounded-full" />
                  ) : (
                    <div className="w-full bg-gray-200/50 dark:bg-zinc-800/50 h-1 rounded-full" />
                  )}
                </div>

                {/* Mini Active Pill Badge */}
                {isActive && (
                  <span className="absolute -top-2 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-600 text-white tracking-wider shadow-sm uppercase">
                    Stage {stageNum}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. STAGE SPRINT FOCUS HEADER (Showing Question X of 5)
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentStageConfig.colorScheme.gradient} text-white shadow-md shadow-blue-500/10`}>
            <StageIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${currentStageConfig.colorScheme.badge}`}>
                Stage {sprintProgress.currentStage} of 5
              </span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium hidden sm:inline">
                • {currentStageConfig.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">
              {currentStageConfig.name}
            </h1>
          </div>
        </div>

        {/* Focused Stage Question Sprint Counter (01 / 05) */}
        <div className="flex items-center space-x-3 self-end sm:self-auto bg-white/70 dark:bg-zinc-900/70 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 shadow-sm">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block">
              Stage Progress
            </span>
            <div className="flex items-baseline space-x-1 font-mono">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                0{sprintProgress.stageQuestion}
              </span>
              <span className="text-sm font-semibold text-gray-400 dark:text-zinc-500">
                / 05
              </span>
            </div>
          </div>

          {/* 5 Dots Indicator for the 5 Stage Questions */}
          <div className="flex space-x-1.5 pl-2 border-l border-gray-200 dark:border-zinc-800">
            {Array.from({ length: 5 }, (_, dotIdx) => {
              const isPast = dotIdx + 1 < sprintProgress.stageQuestion;
              const isCurrent = dotIdx + 1 === sprintProgress.stageQuestion;

              return (
                <div
                  key={dotIdx}
                  className={`w-2.5 h-6 rounded-full transition-all duration-300 ${
                    isPast
                      ? 'bg-blue-600 dark:bg-blue-500 shadow-sm'
                      : isCurrent
                      ? 'bg-gradient-to-b from-blue-500 to-indigo-600 shadow-md ring-2 ring-blue-400/40 animate-pulse'
                      : 'bg-gray-200 dark:bg-zinc-800'
                  }`}
                  title={`Question ${dotIdx + 1} of 5`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN QUESTION CARD WITH OPTIONS
         ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.text}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Card className="p-6 sm:p-8 border-2 border-gray-200/90 dark:border-zinc-800/90 rounded-2xl shadow-xl dark:bg-zinc-900/95 relative overflow-hidden backdrop-blur-xl">
            {/* Ambient Stage Glow Accent at Top */}
            <div 
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${currentStageConfig.colorScheme.gradient}`} 
            />

            <div className="space-y-6">
              {/* Question Header */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Question {sprintProgress.stageQuestion} of 5 in this stage</span>
                  <span className="text-gray-300 dark:text-zinc-700">•</span>
                  <span>~1 min</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed tracking-tight">
                  {question.text}
                </h2>
              </div>

              {/* Answer Option Cards */}
              <div className="space-y-3 pt-2">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const letterKey = String.fromCharCode(65 + index); // A, B, C, D

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.006, y: -1 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setSelectedAnswer(option)}
                      className={`
                        relative flex items-center justify-between p-4 sm:p-4.5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none
                        ${isSelected
                          ? `border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-md ${currentStageConfig.colorScheme.borderSelected}`
                          : 'border-gray-200 dark:border-zinc-800/80 hover:border-gray-300 dark:hover:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3.5 flex-1 pr-4">
                        {/* Keyboard Badge [A], [B], [C], [D] */}
                        <span className={`
                          w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-colors shadow-sm
                          ${isSelected
                            ? 'bg-blue-600 text-white shadow-blue-500/30'
                            : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200/80 dark:border-zinc-700'
                          }
                        `}>
                          {letterKey}
                        </span>

                        {/* Option Text */}
                        <span className={`text-base font-medium leading-snug ${
                          isSelected 
                            ? 'text-gray-900 dark:text-white font-semibold' 
                            : 'text-gray-700 dark:text-zinc-300'
                        }`}>
                          {option}
                        </span>
                      </div>

                      {/* Selected Radio Indicator */}
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                        ${isSelected
                          ? 'bg-blue-600 text-white scale-110 shadow-sm'
                          : 'border-2 border-gray-300 dark:border-zinc-700'
                        }
                      `}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Footer Actions & Keyboard Navigation Helper */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800/80 gap-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                  <span className="hidden sm:inline">⚡ Press keys</span>
                  <div className="inline-flex space-x-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 font-mono text-[10px]">1-4</kbd>
                    <span className="text-gray-400">or</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 font-mono text-[10px]">A-D</kbd>
                  </div>
                  <span>to select •</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 font-mono text-[10px]">Enter ↵</kbd>
                  <span>to submit</span>
                </div>

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || isSubmitting || isLoading}
                  className={`
                    w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200
                    bg-gradient-to-r ${currentStageConfig.colorScheme.gradient} hover:opacity-95 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Saving answer...</span>
                    </>
                  ) : (
                    <>
                      <span>{sprintProgress.stageQuestion === 5 ? 'Complete Stage' : 'Next Question'}</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* =========================================================================
          4. INNOVATIVE "STAGE COMPLETE / MILESTONE UNLOCK" OVERLAY MODAL
         ========================================================================= */}
      <AnimatePresence>
        {showStageTransition && stageTransitionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-lg w-full bg-white dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Background Ambient Glow */}
              <div className="absolute -top-24 -right-24 w-52 h-52 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-6 relative z-10 text-center">
                {/* Milestone Sparkle Pill */}
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Stage {stageTransitionData.completedStageNumber} of 5 Complete</span>
                </div>

                {/* Animated Glowing Icon Badge */}
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 animate-pulse opacity-40 blur-md" />
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl">
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </div>
                </div>

                {/* Milestone Title */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {stageTransitionData.completedStageName} Captured!
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 font-medium">
                    All 5 questions in this stage have been verified and processed.
                  </p>
                </div>

                {/* Live AI Micro-Takeaway */}
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/80 text-left">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1.5">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>AI Takeaway</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-zinc-200 leading-relaxed">
                    {stageTransitionData.insight}
                  </p>
                </div>

                {/* Next Stage Preview Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/5 via-fuchsia-500/5 to-purple-500/5 border border-purple-200 dark:border-purple-800/40 text-left">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                    Up Next: Stage {stageTransitionData.nextStageNumber}
                  </span>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-purple-600 text-white shadow-sm mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {stageTransitionData.nextStageName}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 mt-0.5">
                        {stageTransitionData.nextTeaser}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action CTA & Auto-Advance Control */}
                <div className="pt-2 space-y-3">
                  <Button
                    onClick={handleDismissTransition}
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-base text-white shadow-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Stage {stageTransitionData.nextStageNumber}</span>
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>

                  {/* Circular Auto-Advance Timer */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-zinc-400">
                    <button
                      onClick={() => setIsCountdownPaused(!isCountdownPaused)}
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      title={isCountdownPaused ? 'Resume countdown' : 'Pause countdown'}
                    >
                      {isCountdownPaused ? <Play className="w-3.5 h-3.5 text-blue-500" /> : <Pause className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                    <span>
                      {isCountdownPaused 
                        ? 'Auto-advance paused' 
                        : `Auto-advancing in ${countdownSeconds}s...`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default QuizInterface;
