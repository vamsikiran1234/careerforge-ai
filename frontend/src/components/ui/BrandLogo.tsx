import React from 'react';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'monogram' | 'wordmark' | 'symbol' | 'compact';
  theme?: 'light' | 'dark' | 'gradient' | 'monochrome';
  className?: string;
  animated?: boolean;
}

const sizeConfig = {
  xs: { icon: 20, text: 'text-sm', badge: 'text-[9px] px-1 py-0.5', gap: 'gap-2' },
  sm: { icon: 26, text: 'text-base', badge: 'text-[10px] px-1.5 py-0.5', gap: 'gap-2' },
  md: { icon: 34, text: 'text-lg', badge: 'text-xs px-1.5 py-0.5', gap: 'gap-2.5' },
  lg: { icon: 42, text: 'text-xl', badge: 'text-xs px-2 py-0.5', gap: 'gap-3' },
  xl: { icon: 52, text: 'text-2xl', badge: 'text-sm px-2 py-1', gap: 'gap-3.5' },
  '2xl': { icon: 64, text: 'text-3xl', badge: 'text-sm px-2.5 py-1', gap: 'gap-4' },
};

/**
 * The unified, unique, creatively simple mark for CareerForge AI:
 * The Forged Apex — an upward trajectory chevron anchored into a precision anvil base with an AI core.
 */
export const CareerForgeMark: React.FC<{
  size?: number;
  className?: string;
  animated?: boolean;
}> = ({ size = 32, className = '', animated = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} ${animated ? 'transition-transform duration-300 hover:scale-105' : ''}`}
  >
    <defs>
      <linearGradient id="cf-mark-gradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="55%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="cf-anvil-gradient" x1="8" y1="22" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.85" />
      </linearGradient>
    </defs>

    {/* Modern Rounded Squircle Base */}
    <rect width="36" height="36" rx="9" fill="url(#cf-mark-gradient)" />
    
    {/* Subtle Glassmorphic Highlight Rim */}
    <rect x="0.75" y="0.75" width="34.5" height="34.5" rx="8.25" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />

    {/* Upward Career Trajectory Arrow (Ascent) */}
    <path
      d="M18 7.5L25.5 15H20.5V21H15.5V15H10.5L18 7.5Z"
      fill="white"
    />

    {/* Precision Forge Anvil Base (Foundation) */}
    <path
      d="M10 23C10 22.45 10.45 22 11 22H25C25.55 22 26 22.45 26 23V24C26 25.1 25.1 26 24 26H12C10.9 26 10 25.1 10 24V23Z"
      fill="url(#cf-anvil-gradient)"
    />

    {/* Central AI Precision Pulse Point */}
    <circle cx="18" cy="15" r="1.5" fill="#2563EB" />
  </svg>
);

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'default',
  theme: _theme = 'gradient',
  className = '',
  animated = false,
}) => {
  const cfg = sizeConfig[size];

  // Symbol only
  if (variant === 'symbol' || variant === 'monogram') {
    return <CareerForgeMark size={cfg.icon} className={className} animated={animated} />;
  }

  // Wordmark only
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className={`${cfg.text} font-bold tracking-tight text-gray-900 dark:text-white`}>
          CareerForge
        </span>
        <span className={`${cfg.badge} font-bold tracking-wider rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400 border border-blue-500/20 uppercase`}>
          AI
        </span>
      </div>
    );
  }

  // Default and Compact (Mark + Typography + AI Pill)
  return (
    <div className={`inline-flex items-center ${cfg.gap} ${className}`}>
      <CareerForgeMark size={cfg.icon} animated={animated} />
      <div className="flex items-center gap-1.5">
        <span className={`${cfg.text} font-extrabold tracking-tight text-gray-900 dark:text-white leading-none`}>
          CareerForge
        </span>
        <span className={`${cfg.badge} font-bold tracking-wider rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300 border border-blue-500/20 uppercase leading-none`}>
          AI
        </span>
      </div>
    </div>
  );
};

// Presets for easy layout usage
export const HeaderLogo = () => <BrandLogo size="md" variant="default" animated />;
export const SidebarLogo = () => <BrandLogo size="sm" variant="default" />;
export const FooterLogo = () => <BrandLogo size="md" variant="default" />;
export const FaviconLogo = () => <CareerForgeMark size={32} />;

export default BrandLogo;
