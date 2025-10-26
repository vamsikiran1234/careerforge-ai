import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'monogram' | 'wordmark' | 'symbol' | 'compact';
  theme?: 'light' | 'dark' | 'gradient' | 'monochrome';
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  xs: { icon: 18, text: 'text-xs', height: 'h-7', subtitle: 'text-[10px]' },
  sm: { icon: 24, text: 'text-sm', height: 'h-9', subtitle: 'text-xs' },
  md: { icon: 32, text: 'text-lg', height: 'h-12', subtitle: 'text-sm' },
  lg: { icon: 40, text: 'text-xl', height: 'h-14', subtitle: 'text-base' },
  xl: { icon: 52, text: 'text-2xl', height: 'h-18', subtitle: 'text-lg' },
  '2xl': { icon: 68, text: 'text-3xl', height: 'h-22', subtitle: 'text-xl' },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'default',
  theme = 'gradient',
  className = '',
  animated = false,
}) => {
  const { icon: iconSize, text: textSize, height } = sizeConfig[size];

  // Theme configurations
  const themeStyles = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      accent: 'text-blue-600',
      border: 'border-gray-200',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      accent: 'text-blue-400',
      border: 'border-gray-700',
    },
    gradient: {
      bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600',
      text: 'text-white',
      accent: 'text-white',
      border: 'border-transparent',
    },
    monochrome: {
      bg: 'bg-gray-800',
      text: 'text-white',
      accent: 'text-gray-300',
      border: 'border-gray-600',
    },
  };

  const currentTheme = themeStyles[theme];

  // Unique CareerForge Symbol - Forge + Growth + AI
  const CareerForgeSymbol = ({ className: symbolClass = '' }: { className?: string }) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${symbolClass} ${animated ? 'animate-pulse' : ''}`}
    >
      {/* Forge Anvil Base - Represents Foundation */}
      <path
        d="M8 30 L32 30 Q34 30 34 28 L34 26 Q34 24 32 24 L8 24 Q6 24 6 26 L6 28 Q6 30 8 30 Z"
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* Career Growth Trajectory - Ascending Path */}
      <path
        d="M10 24 L12 20 L16 16 L20 12 L24 8 L28 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Milestone Markers - Career Stages */}
      <circle cx="12" cy="20" r="1.5" fill="currentColor" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      <circle cx="20" cy="12" r="1.5" fill="currentColor" />
      <circle cx="24" cy="8" r="1.5" fill="currentColor" />
      
      {/* AI Brain/Network - Top Achievement */}
      <circle cx="28" cy="6" r="3" fill="currentColor" />
      <circle cx="28" cy="6" r="1.5" fill="white" opacity="0.95" />
      
      {/* Neural Connections - AI Intelligence */}
      <path d="M25 8 L22 10" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M31 8 L34 10" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M26 4 L24 2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <path d="M30 4 L32 2" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      
      {/* Forge Hammer - Active Creation */}
      <rect x="14" y="32" width="12" height="2" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="18" y="28" width="4" height="6" rx="1" fill="currentColor" opacity="0.6" />
    </svg>
  );

  // Unique Monogram - Forge Symbol with CF
  const ForgeMonogram = ({ className: monoClass = '' }: { className?: string }) => (
    <div
      className={`${currentTheme.bg} ${currentTheme.border} border-2 rounded-xl flex items-center justify-center relative overflow-hidden ${monoClass}`}
      style={{ width: iconSize, height: iconSize }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 20 20">
          <path d="M2 18 L10 10 L18 2" stroke="currentColor" strokeWidth="0.5" />
          <path d="M6 18 L14 10 L18 6" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      
      {/* Main Monogram */}
      <div className="relative flex flex-col items-center justify-center">
        <span className={`${currentTheme.text} font-black leading-none`} style={{ fontSize: iconSize * 0.35 }}>
          CF
        </span>
        <div className={`w-3 h-0.5 ${currentTheme.text} opacity-60 mt-0.5`} style={{ width: iconSize * 0.3 }} />
      </div>
    </div>
  );

  // Compact Logo
  const CompactLogo = () => (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`${currentTheme.bg} rounded-xl p-2 shadow-sm ${height} flex items-center justify-center`}>
        <CareerForgeSymbol className={currentTheme.text} />
      </div>
      <div className="flex flex-col">
        <span className={`${textSize} font-bold text-gray-900 dark:text-white leading-tight`}>
          CareerForge
        </span>
        <span className={`${sizeConfig[size].subtitle} font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-400`}>
          AI Career Mentor
        </span>
      </div>
    </div>
  );

  // Symbol Only
  if (variant === 'symbol') {
    return (
      <div className={`${currentTheme.bg} rounded-xl p-2 shadow-lg ${className}`} style={{ width: iconSize + 8, height: iconSize + 8 }}>
        <CareerForgeSymbol className={currentTheme.text} />
      </div>
    );
  }

  // Monogram Only
  if (variant === 'monogram') {
    return <ForgeMonogram className={className} />;
  }

  // Wordmark Only
  if (variant === 'wordmark') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <span className={`${textSize} font-bold tracking-tight leading-tight ${
          theme === 'gradient' 
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'
            : currentTheme.text
        }`}>
          CareerForge
        </span>
        <span className={`${sizeConfig[size].subtitle} font-bold tracking-wide uppercase text-gray-600 dark:text-gray-400 mt-1`}>
          AI Career Mentor
        </span>
      </div>
    );
  }

  // Compact Version
  if (variant === 'compact') {
    return <CompactLogo />;
  }

  // Default - Full Logo
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentTheme.bg} rounded-xl p-2 shadow-lg ${animated ? 'hover:scale-105 transition-transform duration-200' : ''}`}>
        <CareerForgeSymbol className={currentTheme.text} />
      </div>
      <div className="flex flex-col">
        <span className={`${textSize} font-bold tracking-tight leading-tight ${
          theme === 'gradient' 
            ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'
            : 'text-gray-900 dark:text-white'
        }`}>
          CareerForge
        </span>
        <span className={`${sizeConfig[size].subtitle} font-semibold tracking-wide uppercase text-gray-600 dark:text-gray-400`}>
          AI Career Mentor
        </span>
      </div>
    </div>
  );
};

// Preset Logo Variants for Common Use Cases
export const HeaderLogo = () => (
  <BrandLogo size="md" variant="compact" theme="gradient" animated />
);

export const SidebarLogo = () => (
  <BrandLogo size="sm" variant="monogram" theme="dark" />
);

export const FooterLogo = () => (
  <BrandLogo size="lg" variant="wordmark" theme="monochrome" />
);

export const FaviconLogo = () => (
  <BrandLogo size="xs" variant="symbol" theme="gradient" />
);

export default BrandLogo;