/**
 * Professional Micro-Interactions Library
 * 
 * Smooth, performant animations that enhance UX
 * Following principles from:
 * - Material Design Motion
 * - Apple Human Interface Guidelines
 * - Framer Motion best practices
 * - 60 FPS animations
 */

import type { Variants, Transition } from 'framer-motion';

/* ============================================================================
   ANIMATION VARIANTS
   ============================================================================ */

// Page Transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Fade In/Out
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Scale In/Out (Modal, Dropdown)
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Slide In (Sidebar, Drawer)
export const slideVariants = {
  fromRight: {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  fromLeft: {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  fromBottom: {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  fromTop: {
    hidden: { y: '-100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      y: '-100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
};

// List Stagger (Children animate in sequence)
export const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Card Hover Effect
export const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
};

// Button Hover Effect
export const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
};

// Icon Bounce
export const iconBounceVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.2,
    rotate: [0, -10, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// Notification Slide In
export const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.3,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Accordion/Collapse
export const accordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Shimmer Effect (Loading)
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Pulse Effect
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Wiggle Effect
export const wiggleVariants: Variants = {
  wiggle: {
    rotate: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/* ============================================================================
   TRANSITION PRESETS
   ============================================================================ */

export const transitions = {
  // Fast for immediate feedback
  fast: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Base for most interactions
  base: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Smooth for complex animations
  smooth: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,

  // Bouncy for playful interactions
  bouncy: {
    type: 'spring',
    damping: 15,
    stiffness: 200,
  } as Transition,

  // Elastic for emphasis
  elastic: {
    type: 'spring',
    damping: 10,
    stiffness: 100,
  } as Transition,

  // Stiff for snappy feel
  stiff: {
    type: 'spring',
    damping: 20,
    stiffness: 300,
  } as Transition,
};

/* ============================================================================
   GESTURE CONFIGURATIONS
   ============================================================================ */

export const gestureConfig = {
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
  hover: {
    scale: 1.05,
    transition: transitions.base,
  },
  drag: {
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.2,
  },
};

/* ============================================================================
   SCROLL ANIMATION PRESETS
   ============================================================================ */

export const scrollAnimationPresets = {
  fadeInUp: {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: transitions.smooth,
  },
  fadeInDown: {
    initial: { opacity: 0, y: -40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: transitions.smooth,
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: transitions.smooth,
  },
  fadeInRight: {
    initial: { opacity: 0, x: 40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: transitions.smooth,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: transitions.smooth,
  },
};

/* ============================================================================
   UTILITY FUNCTIONS
   ============================================================================ */

/**
 * Generate stagger children animation config
 */
export const staggerChildren = (delayBetween: number = 0.1) => ({
  visible: {
    transition: {
      staggerChildren: delayBetween,
    },
  },
});

/**
 * Generate sequential animation delays
 */
export const getSequentialDelay = (index: number, delayBetween: number = 0.1) => ({
  transition: {
    delay: index * delayBetween,
  },
});

/**
 * Create custom spring animation
 */
export const createSpring = (damping: number = 20, stiffness: number = 200) => ({
  type: 'spring' as const,
  damping,
  stiffness,
});

/**
 * Create custom easing animation
 */
export const createEasing = (duration: number = 0.3, ease: number[] = [0.4, 0, 0.2, 1]) => ({
  duration,
  ease,
});

/* ============================================================================
   ANIMATION HOOKS
   ============================================================================ */

/**
 * Use this for elements that appear on scroll
 */
export const useScrollAnimation = (animationType: keyof typeof scrollAnimationPresets = 'fadeInUp') => {
  return scrollAnimationPresets[animationType];
};

/**
 * Use this for hover effects
 */
export const useHoverAnimation = (type: 'card' | 'button' | 'icon' = 'card') => {
  switch (type) {
    case 'card':
      return cardHoverVariants;
    case 'button':
      return buttonHoverVariants;
    case 'icon':
      return iconBounceVariants;
  }
};

/* ============================================================================
   PERFORMANCE OPTIMIZATIONS
   ============================================================================ */

/**
 * Optimized animation props for better performance
 * Use these for complex animations with many elements
 */
export const optimizedAnimationProps = {
  // Prevent layout thrashing
  layout: false,
  // Use transform instead of layout properties
  style: { willChange: 'transform, opacity' },
  // Reduce paint operations
  transformTemplate: ({ rotate, scale, x, y }: any) =>
    `translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`,
};

/**
 * Use this for list items that animate in
 */
export const optimizedListAnimation = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  variants: listVariants,
  ...optimizedAnimationProps,
};

export default {
  // Variants
  pageVariants,
  fadeVariants,
  scaleVariants,
  slideVariants,
  listVariants,
  listItemVariants,
  cardHoverVariants,
  buttonHoverVariants,
  iconBounceVariants,
  notificationVariants,
  accordionVariants,
  shimmerVariants,
  pulseVariants,
  wiggleVariants,

  // Transitions
  transitions,

  // Gesture
  gestureConfig,

  // Scroll
  scrollAnimationPresets,
  useScrollAnimation,
  useHoverAnimation,

  // Utilities
  staggerChildren,
  getSequentialDelay,
  createSpring,
  createEasing,
  optimizedAnimationProps,
  optimizedListAnimation,
};
