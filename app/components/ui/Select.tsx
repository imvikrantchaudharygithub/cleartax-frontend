'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <motion.select
            ref={ref}
            className={clsx(
              'w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg appearance-none',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
              'transition-all duration-200 bg-white',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-error focus:border-error focus:ring-error',
              className
            )}
            whileFocus={{ borderColor: '#00A3E0' }}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </motion.select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-error animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

