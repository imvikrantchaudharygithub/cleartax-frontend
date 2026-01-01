'use client';

import { motion } from 'framer-motion';
import CounterAnimation from '../animations/CounterAnimation';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export default function StatCard({ icon: Icon, value, label, variant = 'info' }: StatCardProps) {
  const variantStyles = {
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-error/10 border-error/20 text-error',
    info: 'bg-accent/10 border-accent/20 text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' }}
      className={clsx(
        'p-6 rounded-xl border-2 transition-all',
        variantStyles[variant]
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8" />
        <div className="text-3xl font-bold font-heading">
          <CounterAnimation end={value} format="number" />
        </div>
      </div>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </motion.div>
  );
}

