import { Variants } from 'framer-motion';

// Container variants for stagger children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Item variants for stagger
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Card hover variants
export const cardHoverVariants: Variants = {
  initial: { scale: 1, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' },
  hover: {
    scale: 1.05,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
  tap: {
    scale: 0.98,
  },
};

// Button tap variants
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Fade in variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Slide up variants
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Scale in variants
export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Page transition variants
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// Rotation variants (for icons)
export const rotationVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 180,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
};

// Input focus variants
export const inputFocusVariants: Variants = {
  blur: { scale: 1, borderColor: '#d1d5db' },
  focus: {
    scale: 1.01,
    borderColor: '#00A3E0',
    transition: {
      duration: 0.2,
    },
  },
};

// Progress bar variants
export const progressVariants: Variants = {
  initial: { width: '0%' },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

// Shake animation (for errors)
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-4, 4, -4, 4, 0],
    transition: {
      duration: 0.3,
    },
  },
};

