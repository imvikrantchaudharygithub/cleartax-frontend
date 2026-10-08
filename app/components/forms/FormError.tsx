'use client';

import { motion } from 'framer-motion';
import { shakeVariants } from '@/app/lib/animations/staggerConfig';
import { AlertCircle } from 'lucide-react';
import { FV_DANGER_TEXT, FV_DANGER_VARS } from '@/app/components/fv/field';

interface FormErrorProps {
  message?: string;
}

// Public-only (calculators, contact, auth) — themed with the red category colour.
export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <motion.div
      variants={shakeVariants}
      initial="initial"
      animate="shake"
      style={FV_DANGER_VARS}
      className={`flex items-center gap-2 rounded-[8px] border border-[color-mix(in_srgb,var(--c)_30%,transparent)] bg-[var(--cp)] p-3 text-sm font-medium ${FV_DANGER_TEXT}`}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </motion.div>
  );
}
