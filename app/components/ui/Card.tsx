'use client';

import { motion } from 'framer-motion';
import { cardHoverVariants } from '@/app/lib/animations/staggerConfig';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hoverable = false, onClick }: CardProps) {
  const CardComponent = hoverable ? motion.div : 'div';
  
  const props = hoverable
    ? {
        variants: cardHoverVariants,
        initial: "initial",
        whileHover: "hover",
        whileTap: onClick ? "tap" : undefined,
      }
    : {};

  return (
    <CardComponent
      className={clsx(
        'bg-white rounded-lg shadow-card p-6',
        hoverable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
}

