/**
 * Professional Design System for CareerForge AI
 * 
 * Following industry standards from:
 * - Material Design 3 (Google)
 * - Apple Human Interface Guidelines
 * - Stripe Design System
 * - Linear Design System
 * - Vercel Design System
 * 
 * Features:
 * - Mixed color palette (not pure white)
 * - Professional gradients
 * - Accessible color contrasts (WCAG AA+)
 * - Modern glassmorphism effects
 * - Micro-interaction ready
 */

// ============================================================================
// COLOR PALETTE - Mixed Colors for Light Theme
// ============================================================================

export const professionalColors = {
  // Background Colors (Mixed, not pure white)
  background: {
    primary: '#FAFBFC',      // Slightly off-white with blue tint
    secondary: '#F6F8FA',    // Lighter gray-blue
    tertiary: '#FFFFFF',     // Pure white for cards
    elevated: '#FFFFFF',     // Cards elevated above background
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
    glass: 'rgba(255, 255, 255, 0.7)', // Glassmorphism
  },

  // Surface Colors (Cards, panels, etc.)
  surface: {
    default: '#FFFFFF',
    hover: '#F9FAFB',
    active: '#F3F4F6',
    disabled: '#F9FAFB',
    elevated: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.8)',
  },

  // Text Colors
  text: {
    primary: '#111827',      // Near-black, excellent readability
    secondary: '#6B7280',    // Medium gray
    tertiary: '#9CA3AF',     // Light gray
    disabled: '#D1D5DB',     // Very light gray
    inverse: '#FFFFFF',      // White text on dark backgrounds
    link: '#2563EB',         // Blue for links
    linkHover: '#1D4ED8',    // Darker blue on hover
  },

  // Brand Colors (Primary actions, highlights)
  brand: {
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',  // Main brand color
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },
    secondary: {
      50: '#F0FDFA',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#14B8A6',  // Teal accent
      600: '#0D9488',
      700: '#0F766E',
      800: '#115E59',
      900: '#134E4A',
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#ECFDF5',
      DEFAULT: '#10B981',
      dark: '#047857',
      text: '#065F46',
    },
    warning: {
      light: '#FEF3C7',
      DEFAULT: '#F59E0B',
      dark: '#D97706',
      text: '#92400E',
    },
    error: {
      light: '#FEE2E2',
      DEFAULT: '#EF4444',
      dark: '#DC2626',
      text: '#991B1B',
    },
    info: {
      light: '#DBEAFE',
      DEFAULT: '#3B82F6',
      dark: '#2563EB',
      text: '#1E40AF',
    },
  },

  // Border Colors
  border: {
    default: '#E5E7EB',
    hover: '#D1D5DB',
    active: '#9CA3AF',
    focus: '#6366F1',
    error: '#EF4444',
    success: '#10B981',
  },

  // Gradient Backgrounds (Modern & Professional)
  gradients: {
    primary: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    secondary: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    success: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
    ocean: 'linear-gradient(135deg, #667EEA 0%, #2DD4BF 100%)',
    sunset: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
    night: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    mesh: 'radial-gradient(at 40% 20%, #6366F1 0px, transparent 50%), radial-gradient(at 80% 0%, #2DD4BF 0px, transparent 50%), radial-gradient(at 0% 50%, #F59E0B 0px, transparent 50%)',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Consolas, Monaco, monospace",
    display: "'Cal Sans', 'Inter', sans-serif", // For headings
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// ============================================================================
// SPACING (8px grid system)
// ============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
};

// ============================================================================
// SHADOWS (Layered elevation system)
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  glow: '0 0 20px rgba(99, 102, 241, 0.5)',
  glowLg: '0 0 40px rgba(99, 102, 241, 0.6)',
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// ============================================================================
// ANIMATIONS & TRANSITIONS
// ============================================================================

export const animations = {
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    slideDown: {
      '0%': { transform: 'translateY(-10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
      '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
    },
  },
};

// ============================================================================
// COMPONENT PRESETS
// ============================================================================

export const componentPresets = {
  // Button variants
  button: {
    primary: {
      background: professionalColors.brand.primary[500],
      backgroundHover: professionalColors.brand.primary[600],
      text: professionalColors.text.inverse,
      shadow: shadows.sm,
      shadowHover: shadows.md,
    },
    secondary: {
      background: professionalColors.surface.default,
      backgroundHover: professionalColors.surface.hover,
      text: professionalColors.text.primary,
      border: professionalColors.border.default,
      shadow: shadows.sm,
    },
    ghost: {
      background: 'transparent',
      backgroundHover: professionalColors.surface.hover,
      text: professionalColors.text.secondary,
    },
  },

  // Card variants
  card: {
    default: {
      background: professionalColors.surface.elevated,
      border: professionalColors.border.default,
      shadow: shadows.DEFAULT,
      shadowHover: shadows.md,
      borderRadius: borderRadius.lg,
    },
    interactive: {
      background: professionalColors.surface.elevated,
      backgroundHover: professionalColors.surface.hover,
      border: professionalColors.border.default,
      borderHover: professionalColors.border.hover,
      shadow: shadows.DEFAULT,
      shadowHover: shadows.lg,
      borderRadius: borderRadius.xl,
    },
    glass: {
      background: professionalColors.surface.glass,
      backdropFilter: 'blur(12px) saturate(180%)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: shadows.lg,
      borderRadius: borderRadius.xl,
    },
  },

  // Input variants
  input: {
    default: {
      background: professionalColors.surface.default,
      border: professionalColors.border.default,
      borderFocus: professionalColors.border.focus,
      text: professionalColors.text.primary,
      placeholder: professionalColors.text.tertiary,
      borderRadius: borderRadius.md,
    },
  },
};

// ============================================================================
// BREAKPOINTS (Mobile-first)
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate glassmorphism CSS
 */
export const glassMorphism = (opacity = 0.7) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
});

/**
 * Generate hover lift effect
 */
export const hoverLift = {
  transition: animations.transition.base,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: shadows.lg,
  },
};

/**
 * Generate focus ring (accessibility)
 */
export const focusRing = {
  outline: 'none',
  '&:focus-visible': {
    outline: `2px solid ${professionalColors.border.focus}`,
    outlineOffset: '2px',
  },
};

export default {
  professionalColors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  componentPresets,
  breakpoints,
  zIndex,
  glassMorphism,
  hoverLift,
  focusRing,
};
