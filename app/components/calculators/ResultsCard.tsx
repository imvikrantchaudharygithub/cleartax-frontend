'use client';

import { motion } from 'framer-motion';
import { slideUpVariants } from '@/app/lib/animations/staggerConfig';
import { clsx } from 'clsx';

interface ResultsCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ResultsCard({ title, children, className }: ResultsCardProps) {
  return (
    <motion.div
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        'bg-white rounded-xl shadow-card p-6',
        className
      )}
    >
      <h3 className="font-heading font-semibold text-xl text-primary mb-4">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

