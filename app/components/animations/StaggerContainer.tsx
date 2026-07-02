'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/app/lib/animations/staggerConfig';
import { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export default function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  delayChildren = 0.2,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  const customVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  // With reduced motion, render fully visible immediately — never leave content
  // stuck at opacity:0 waiting on an animation the user opted out of.
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

