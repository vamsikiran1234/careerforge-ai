import React from 'react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'full' | 'icon' | 'text' | 'minimal';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

const sizeMap = {
  xs: { icon: 20, text: 'text-sm', spacing: 'space-x-2' },
  sm: { icon: 24, text: 'text-base', spacing: 'space-x-2' },
  md: { icon: 32, text: 'text-xl', spacing: 'space-x-3' },
  lg: { icon: 40, text: 'text-2xl', spacing: 'space-x-3' },
  xl: { icon: 48, text: 'text-3xl', spacing: 'space-x-4' },
  '2xl': { icon: 64, text: 'text-4xl', spacing: 'space-x-4' },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  theme = 'auto'
}) => {
  const { icon: iconSize, text: textSize, spacing } = sizeMap[size];

  // Modern Professional Logo Icon - Geometric Career Path with AI Elements
  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-all duration-300`}
    >
      {/* Background Circle with Subtle Gradient */}
      <circle
        cx="60"
        cy="60"
        r="56"
        fill="url(#backgroundGradient)"
        className="drop-shadow-lg"
      />

      {/* Career Path - Ascending Steps */}
      <g className="career-path">
        {/* Step 1 */}
        <rect x="25" y="85" width="20" height="8" rx="4" fill="url(#stepGradient1)" />
        {/* Step 2 */}
        <rect x="35" y="70" width="20" height="8" rx="4" fill="url(#stepGradient2)" />
        {/* Step 3 */}
        <rect x="45" y="55" width="20" height="8" rx="4" fill="url(#stepGradient3)" />
        {/* Step 4 */}
        <rect x="55" y="40" width="20" height="8" rx="4" fill="url(#stepGradient4)" />

        {/* Connecting Lines */}
        <path
          d="M45 89 Q50 82 55 74 Q60 66 65 59 Q70 52 75 44"
          stroke="url(#pathGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          className="animate-pulse"
        />
      </g>

      {/* AI Neural Network Nodes */}
      <g className="ai-nodes" opacity="0.8">
        <circle cx="30" cy="30" r="3" fill="url(#nodeGradient)" />
        <circle cx="90" cy="30" r="3" fill="url(#nodeGradient)" />
        <circle cx="30" cy="90" r="3" fill="url(#nodeGradient)" />
        <circle cx="90" cy="90" r="3" fill="url(#nodeGradient)" />

        {/* Neural Connections */}
        <line x1="30" y1="30" x2="60" y2="45" stroke="url(#connectionGradient)" strokeWidth="1.5" opacity="0.6" />
        <line x1="90" y1="30" x2="60" y2="45" stroke="url(#connectionGradient)" strokeWidth="1.5" opacity="0.6" />
        <line x1="30" y1="90" x2="60" y2="75" stroke="url(#connectionGradient)" strokeWidth="1.5" opacity="0.6" />
        <line x1="90" y1="90" x2="60" y2="75" stroke="url(#connectionGradient)" strokeWidth="1.5" opacity="0.6" />
      </g>

      {/* Central AI Core */}
      <circle cx="60" cy="60" r="12" fill="url(#coreGradient)" className="drop-shadow-md" />
      <circle cx="60" cy="60" r="6" fill="white" opacity="0.95" />
      <circle cx="60" cy="60" r="3" fill="url(#innerCoreGradient)" />

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <linearGradient id="stepGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        <linearGradient id="stepGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <linearGradient id="stepGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        <linearGradient id="stepGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>

        <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <linearGradient id="coreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <linearGradient id="innerCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Minimal Badge Version
  const LogoBadge = () => (
    <div
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
      style={{ width: iconSize, height: iconSize }}
    >
      <svg
        width={iconSize * 0.65}
        height={iconSize * 0.65}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        {/* Simplified Career Steps */}
        <path
          d="M3 18h4v-4h4v-4h4v-4h6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* AI Dot */}
        <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.9" />
        <circle cx="12" cy="12" r="1" fill="white" />
      </svg>
    </div>
  );

  // Ultra Minimal Version
  const LogoMinimal = () => (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <span className={`${textSize} font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
        CF
      </span>
    </div>
  );

  if (variant === 'minimal') {
    return <LogoMinimal />;
  }

  if (variant === 'icon') {
    return size === 'xs' || size === 'sm' ? <LogoBadge /> : <LogoIcon />;
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
          CareerForge
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase">
          AI Platform
        </span>
      </div>
    );
  }

  // Full logo with icon and text
  return (
    <div className={`flex items-center ${spacing} ${className}`}>
      {size === 'xs' || size === 'sm' ? <LogoBadge /> : <LogoIcon />}
      <div className="flex flex-col">
        <span className={`${textSize} font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none`}>
          CareerForge
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-widest uppercase opacity-75">
          AI Platform
        </span>
      </div>
    </div>
  );
};

// Simple badge version for very small spaces
export const LogoSimple: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = ''
}) => (
  <div
    className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg ${className}`}
    style={{ width: size, height: size }}
  >
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
