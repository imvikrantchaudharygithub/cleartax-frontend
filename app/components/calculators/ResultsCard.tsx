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
        'fv-card min-w-0 p-5 md:p-6',
        className
      )}
    >
      <h3 className="mb-5 text-lg font-bold tracking-tight text-fv-navy">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}
