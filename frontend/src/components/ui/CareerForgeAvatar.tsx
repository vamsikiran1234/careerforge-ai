import React from 'react';

interface CareerForgeAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showGradient?: boolean;
}

export const CareerForgeAvatar: React.FC<CareerForgeAvatarProps> = ({
  size = 'md',
  className = '',
  showGradient = true,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const baseClasses = `
    ${sizeClasses[size]}
    rounded-xl
    flex items-center justify-center
    shadow-lg
    ${showGradient 
      ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-emerald-500 dark:via-green-600 dark:to-teal-700' 
      : 'bg-blue-600 dark:bg-green-600'
    }
    border-2 border-white/20
    backdrop-blur-sm
    ${className}
  `;

  return (
    <div className={baseClasses}>
      {/* Realistic 3D CareerForge AI Logo */}
      <svg
        className={`${iconSizes[size]} text-white drop-shadow-lg`}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 3D Gradients for depth */}
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
          
          <linearGradient id="ladderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.9" />
          </linearGradient>

          {/* 3D Shadow effects */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Background circle for 3D effect */}
        <circle cx="60" cy="60" r="50" fill="url(#mountainGrad)" opacity="0.1" />
        
        {/* Main logo design */}
        <g transform="translate(60, 60) scale(1.2) translate(-60, -60)">
          {/* Left mountain peak with 3D effect */}
          <path 
            d="M30 85 L45 40 L55 60 L50 85 Z" 
            fill="url(#mountainGrad)"
            filter="url(#shadow)"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
          
          {/* Right mountain peak with 3D effect */}
          <path 
            d="M70 85 L75 60 L85 40 L90 85 Z" 
            fill="url(#mountainGrad)"
            filter="url(#shadow)"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity="0.3"
          />
          
          {/* Central ladder with enhanced 3D appearance */}
          <g fill="url(#ladderGrad)" filter="url(#shadow)">
            {/* Ladder sides with 3D depth */}
            <rect x="56" y="35" width="3" height="50" rx="1.5" />
            <rect x="61" y="35" width="3" height="50" rx="1.5" />
            
            {/* Ladder rungs with 3D effect */}
            <rect x="56" y="42" width="8" height="2.5" rx="1" />
            <rect x="56" y="50" width="8" height="2.5" rx="1" />
            <rect x="56" y="58" width="8" height="2.5" rx="1" />
            <rect x="56" y="66" width="8" height="2.5" rx="1" />
            <rect x="56" y="74" width="8" height="2.5" rx="1" />
          </g>
          
          {/* Tech accent elements */}
          <circle cx="45" cy="55" r="1.5" fill="currentColor" opacity="0.8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="75" cy="55" r="1.5" fill="currentColor" opacity="0.8">
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* Success path arrow */}
          <path 
            d="M40 75 Q60 70 80 75" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            opacity="0.6"
            strokeLinecap="round"
          />
          <polygon 
            points="78,73 82,75 78,77" 
            fill="currentColor" 
            opacity="0.6"
          />
        </g>
      </svg>
    </div>
  );
};

// Alternative Professional CareerForge Logo with Typography
export const CareerForgeLogo: React.FC<CareerForgeAvatarProps> = ({
  size = 'md',
  className = '',
  showGradient = true,
}) => {
  const containerSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8', 
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={`
      ${containerSizes[size]}
      rounded-xl
      flex items-center justify-center
      ${showGradient 
        ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600' 
        : 'bg-blue-600'
      }
      shadow-lg
      ${className}
    `}>
      <span className={`
        ${textSizes[size]} 
        font-bold 
        text-white 
        tracking-tight
      `}>
        CF
      </span>
    </div>
  );
};

// Modern Geometric CareerForge Avatar
export const CareerForgeModernAvatar: React.FC<CareerForgeAvatarProps> = ({
  size = 'md',
  className = '',
  showGradient = true,
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      rounded-lg
      flex items-center justify-center
      ${showGradient 
        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600' 
        : 'bg-indigo-600'
      }
      shadow-sm
      ${className}
    `}>
      {/* Modern geometric design */}
      <svg
        className="w-3/4 h-3/4 text-white"
        viewBox="0 0 24 24"
        fill="none"
      >
        {/* Hexagonal AI pattern */}
        <path 
          d="M12 2L22 8.5v7L12 22L2 15.5v-7L12 2z" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="rgba(255,255,255,0.1)"
        />
        {/* Inner connection nodes */}
        <circle cx="12" cy="8" r="1" fill="currentColor" />
        <circle cx="8" cy="12" r="1" fill="currentColor" />
        <circle cx="16" cy="12" r="1" fill="currentColor" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
        {/* Connection lines */}
        <path 
          d="M12 8v8M8 12h8M10 10l4 4M14 10l-4 4" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          opacity="0.7"
        />
      </svg>
    </div>
  );
};