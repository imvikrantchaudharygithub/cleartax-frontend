'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, checked, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              checked={checked}
              className="sr-only peer"
              {...props}
            />
            <motion.div
              className={clsx(
                'w-5 h-5 border-2 rounded',
                'transition-colors duration-200',
                'peer-checked:bg-accent peer-checked:border-accent',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2',
                error ? 'border-error' : 'border-gray-300',
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
                  className="flex items-center justify-center h-full"
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.div>
          </div>
          {label && (
            <span className="ml-2 text-gray-700 group-hover:text-gray-900">
              {label}
            </span>
          )}
        </label>
        {error && (
          <p className="mt-1 text-sm text-error animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;

