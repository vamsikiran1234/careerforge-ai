import { useEffect, useState } from 'react';
import { Sparkles, Brain, Target, Zap, CheckCircle2 } from 'lucide-react';

const AILoadingAnimation = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    {
      id: 'analyzing',
      icon: Brain,
      text: 'Analyzing your career path',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
      description: 'Understanding your current role and target position'
    },
    {
      id: 'generating',
      icon: Target,
      text: 'Generating milestones',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
      description: 'Creating personalized career milestones'
    },
    {
      id: 'optimizing',
      icon: Zap,
      text: 'Identifying skill gaps',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500',
      description: 'Finding skills you need to develop'
    },
    {
      id: 'complete',
      icon: CheckCircle2,
      text: 'Recommending resources',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
      description: 'Curating learning materials for you'
    }
  ];

  useEffect(() => {
    // Simulate progress through stages
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 3000); // Change stage every 3 seconds

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const maxProgress = ((currentStage + 1) / stages.length) * 100;
        if (prev < maxProgress - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 30);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [currentStage]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-700">
        {/* Header with animated sparkles */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <Sparkles className="w-12 h-12 text-purple-500 animate-pulse" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Sparkles className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Generating Your AI-Powered Career Trajectory
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Our AI is analyzing your career transition and creating a personalized roadmap
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-4">
          {stages.map((stageData, index) => {
            const Icon = stageData.icon;
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;

            return (
              <div
                key={stageData.id}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 scale-105'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 opacity-50'
                }`}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    isActive
                      ? `${stageData.bgColor} animate-bounce`
                      : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold mb-1 transition-colors ${
                      isActive ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {stageData.text}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{stageData.description}</p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="flex-shrink-0">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This usually takes 5-15 seconds. Please don't close this window.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILoadingAnimation;
