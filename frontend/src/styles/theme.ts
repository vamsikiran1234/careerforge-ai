/**
 * CareerForge AI Design System
 * Professional, modern color palette inspired by leading AI chat interfaces
 * 
 * Usage: Import and use these colors consistently across the application
 * Example: className="bg-cfai-gray-50 text-cfai-gray-900"
 */

export const careerForgeTheme = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Lighter blue
    300: '#93c5fd',  // Medium light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Primary blue
    600: '#2563eb',  // Darker blue
    700: '#1d4ed8',  // Dark blue
    800: '#1e40af',  // Darker blue
    900: '#1e3a8a',  // Very dark blue
  },

  // Neutral Grays (Professional & Clean)
  gray: {
    25: '#fcfcfd',   // Almost white
    50: '#f9fafb',   // Very light gray
    100: '#f3f4f6',  // Light gray (sidebar background)
    150: '#eef2f6',  // Custom light gray
    200: '#e5e7eb',  // Border gray
    300: '#d1d5db',  // Medium light gray
    400: '#9ca3af',  // Medium gray
    500: '#6b7280',  // Text gray (secondary)
    600: '#4b5563',  // Text gray (primary light)
    700: '#374151',  // Text gray (primary)
    800: '#1f2937',  // Dark gray
    900: '#111827',  // Very dark gray (headers)
    950: '#0a0e1a',  // Almost black
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Special Colors
  accent: {
    blue: '#3b82f6',     // Primary accent
    purple: '#8b5cf6',   // Secondary accent  
    green: '#10b981',    // Success accent
    orange: '#f59e0b',   // Warning accent
  },
};

// Typography Scale (Professional & Readable)
export const typography = {
  // Font Families
  fonts: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },

  // Font Sizes (rem units for accessibility)
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px (body text)
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px (headings)
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  // Line Heights
  leading: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Font Weights
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing Scale (Consistent spacing)
export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
};

// Border Radius (Modern & Clean)
export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  base: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

// Shadows (Subtle & Professional)
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

// Component Presets (Ready-to-use combinations)
export const componentPresets = {
  // Chat Message Styles
  userMessage: {
    background: 'transparent',
    text: careerForgeTheme.gray[900],
    avatar: careerForgeTheme.primary[600],
  },
  
  aiMessage: {
    background: careerForgeTheme.gray[50],
    text: careerForgeTheme.gray[800],
    avatar: 'gradient-to-br from-indigo-600 to-blue-600',
  },

  // Button Styles
  primaryButton: {
    background: careerForgeTheme.gray[900],
    hover: careerForgeTheme.gray[800],
    text: '#ffffff',
    border: careerForgeTheme.gray[200],
  },

  secondaryButton: {
    background: '#ffffff',
    hover: careerForgeTheme.gray[50],
    text: careerForgeTheme.gray[700],
    border: careerForgeTheme.gray[200],
  },

  // Sidebar Styles
  sidebar: {
    background: careerForgeTheme.gray[50],
    border: careerForgeTheme.gray[200],
    text: careerForgeTheme.gray[900],
  },

  // Main Chat Area
  chatArea: {
    background: '#ffffff',
    border: careerForgeTheme.gray[100],
  },
};

/**
 * Usage Examples:
 * 
 * // In Tailwind CSS classes:
 * className="bg-gray-50 text-gray-900 border-gray-200"
 * 
 * // In component styles:
 * style={{
 *   backgroundColor: careerForgeTheme.gray[50],
 *   color: careerForgeTheme.gray[900],
 *   borderColor: careerForgeTheme.gray[200],
 * }}
 * 
 * // Using presets:
 * className="bg-white hover:bg-gray-50 text-gray-700"
 */