'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
import { FV_DANGER_VARS, FV_ERROR } from '@/app/components/fv/field';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

// Public-only control (admin does not import it) — themed in place with fv tokens.
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, checked, ...props }, ref) => {
    return (
      <div className="w-full" style={error ? FV_DANGER_VARS : undefined}>
        <label className="group flex cursor-pointer items-center">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <motion.div
              className={clsx(
                'h-5 w-5 rounded-[5px] border-2 bg-white',
                'transition-colors duration-200',
                'peer-checked:border-fv-blue-d peer-checked:bg-fv-blue-d',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-fv-blue-d peer-focus-visible:ring-offset-2',
                error ? 'border-[var(--c)]' : 'border-fv-muted group-hover:border-fv-blue-d',
                className
              )}
              initial={false}
              animate={checked ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {checked && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-full items-center justify-center"
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
                </motion.div>
              )}
            </motion.div>
          </div>
          {label && (
            <span className="ml-2.5 text-[15px] text-fv-slate group-hover:text-fv-navy">
              {label}
            </span>
          )}
        </label>
        {error && <p className={FV_ERROR}>{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
