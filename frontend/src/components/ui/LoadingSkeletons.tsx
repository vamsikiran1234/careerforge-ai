/**
 * Professional Loading Skeleton Components
 * 
 * Industry-standard skeleton screens for better perceived performance
 * Following best practices from:
 * - Facebook (React)
 * - LinkedIn
 * - YouTube
 * - Stripe
 */

import React from 'react';
import { motion } from 'framer-motion';

/* ============================================================================
   BASE SKELETON COMPONENT
   ============================================================================ */

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '2rem'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
};

/* ============================================================================
   SPECIALIZED SKELETON COMPONENTS
   ============================================================================ */

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Skeleton
      variant="circular"
      className={`${sizes[size]} ${className}`}
    />
  );
};

export const SkeletonButton: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <Skeleton
      variant="rounded"
      width="120px"
      height="40px"
      className={className}
    />
  );
};

/* ============================================================================
   CARD SKELETONS (Common Patterns)
   ============================================================================ */

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonMentorCard: React.FC = () => {
  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton variant="rounded" width="80px" height="24px" />
        <Skeleton variant="rounded" width="100px" height="24px" />
        <Skeleton variant="rounded" width="90px" height="24px" />
      </div>

      {/* Description */}
      <SkeletonText lines={3} />

      {/* Stats */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="100px" />
        <Skeleton variant="text" width="80px" />
      </div>

      {/* Button */}
      <SkeletonButton className="w-full" />
    </div>
  );
};

export const SkeletonChatMessage: React.FC<{ isUser?: boolean }> = ({
  isUser = false,
}) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && <SkeletonAvatar size="sm" className="mr-3" />}
      <div className={`space-y-2 ${isUser ? 'max-w-xs' : 'max-w-md'}`}>
        <Skeleton
          variant="rounded"
          height="60px"
          width={isUser ? '200px' : '300px'}
        />
      </div>
    </div>
  );
};

export const SkeletonDashboardStat: React.FC = () => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <Skeleton variant="text" width="60px" />
      </div>
      <Skeleton variant="text" width="40%" className="mb-2" />
      <Skeleton variant="text" width="80%" height="32px" />
      <Skeleton variant="text" width="60%" className="mt-3" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="card">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="text" width="80%" />
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="border-b border-gray-200 dark:border-gray-700 p-4 last:border-0"
        >
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="text" width="60%" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ============================================================================
   FULL PAGE SKELETONS
   ============================================================================ */

export const SkeletonDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton variant="text" width="300px" height="36px" />
        <Skeleton variant="text" width="200px" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonDashboardStat key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
};

export const SkeletonMentorsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="200px" height="36px" />
        <Skeleton variant="rounded" width="120px" height="40px" />
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" width="100px" height="36px" />
        ))}
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonMentorCard key={i} />
        ))}
      </div>
    </div>
  );
};

export const SkeletonChatPage: React.FC = () => {
  return (
    <div className="h-screen flex animate-fade-in">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <Skeleton variant="rounded" height="40px" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="90%" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-3">
            <SkeletonAvatar size="md" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="150px" />
              <Skeleton variant="text" width="100px" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4">
          <SkeletonChatMessage isUser={false} />
          <SkeletonChatMessage isUser={true} />
          <SkeletonChatMessage isUser={false} />
          <SkeletonChatMessage isUser={true} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <Skeleton variant="rounded" height="56px" />
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   LOADING STATES
   ============================================================================ */

export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={`${sizes[size]} border-3 border-primary-200 border-t-primary-600 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-label="Loading"
    />
  );
};

export const LoadingDots: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};

export const LoadingProgress: React.FC<{
  value?: number;
  className?: string;
}> = ({ value = 0, className = '' }) => {
  return (
    <div className={`relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}> = ({ isLoading, children, text = 'Loading...' }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   EMPTY STATES
   ============================================================================ */

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, title, description, action, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonMentorCard,
  SkeletonChatMessage,
  SkeletonDashboardStat,
  SkeletonTable,
  SkeletonDashboardPage,
  SkeletonMentorsPage,
  SkeletonChatPage,
  LoadingSpinner,
  LoadingDots,
  LoadingProgress,
  LoadingOverlay,
  EmptyState,
};
