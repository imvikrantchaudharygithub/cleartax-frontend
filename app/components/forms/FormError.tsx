'use client';

import { motion } from 'framer-motion';
import { shakeVariants } from '@/app/lib/animations/staggerConfig';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
}

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <motion.div
      variants={shakeVariants}
      initial="initial"
      animate="shake"
      className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </motion.div>
  );
}

