import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const sizeMap = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 32, text: 'text-xl' },
  lg: { icon: 40, text: 'text-2xl' },
  xl: { icon: 48, text: 'text-3xl' },
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}) => {
  const { icon: iconSize, text: textSize } = sizeMap[size];

  // SVG Logo Icon - Compass with AI Circuit Paths
  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle - Compass Ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="url(#gradient1)"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Inner Circle */}
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="url(#gradient1)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
      
      {/* Compass Needle - North (Career Direction) */}
      <path
        d="M50 15 L58 45 L50 40 L42 45 Z"
        fill="url(#gradient2)"
        className="drop-shadow-lg"
      />
      
      {/* Compass Needle - South */}
      <path
        d="M50 85 L58 55 L50 60 L42 55 Z"
        fill="url(#gradient3)"
        opacity="0.6"
      />
      
      {/* AI Circuit Paths - Neural Network Lines */}
      <g opacity="0.7">
        {/* Horizontal lines */}
        <line x1="20" y1="50" x2="35" y2="50" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" />
        <line x1="65" y1="50" x2="80" y2="50" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Diagonal lines */}
        <line x1="28" y1="28" x2="38" y2="38" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="28" x2="62" y2="38" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="72" x2="38" y2="62" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="72" x2="62" y2="62" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" />
      </g>
      
      {/* Neural Nodes */}
      <circle cx="20" cy="50" r="3" fill="url(#gradient2)" />
      <circle cx="80" cy="50" r="3" fill="url(#gradient2)" />
      <circle cx="28" cy="28" r="3" fill="url(#gradient2)" />
      <circle cx="72" cy="28" r="3" fill="url(#gradient2)" />
      <circle cx="28" cy="72" r="3" fill="url(#gradient3)" />
      <circle cx="72" cy="72" r="3" fill="url(#gradient3)" />
      
      {/* Center Dot - AI Core */}
      <circle cx="50" cy="50" r="8" fill="url(#gradient2)" className="drop-shadow-xl" />
      <circle cx="50" cy="50" r="4" fill="white" opacity="0.9" />
      
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
    </svg>
  );

  // Logo Badge (for sidebar/nav)
  const LogoBadge = () => (
    <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg ${className}`}
         style={{ width: iconSize, height: iconSize }}>
      <svg
        width={iconSize * 0.6}
        height={iconSize * 0.6}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified compass for small sizes */}
        <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="4" fill="none" opacity="0.6" />
        <path d="M50 20 L56 48 L50 45 L44 48 Z" fill="white" />
        <path d="M50 80 L56 52 L50 55 L44 52 Z" fill="white" opacity="0.4" />
        <circle cx="50" cy="50" r="8" fill="white" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return size === 'sm' || size === 'md' ? <LogoBadge /> : <LogoIcon />;
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className={`${textSize} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          CareerForge
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          AI PLATFORM
        </span>
      </div>
    );
  }

  // Full logo with icon and text
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {size === 'sm' || size === 'md' ? <LogoBadge /> : <LogoIcon />}
      <div className="flex flex-col">
        <span className={`${textSize} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-none`}>
          CareerForge
        </span>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          AI PLATFORM
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
