'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ label, name, options, value, onChange, error, className }, ref) => {
    return (
      <div ref={ref} className={clsx('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="space-y-2">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className="sr-only peer"
              />
              <motion.div
                className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  'transition-colors duration-200',
                  'peer-checked:border-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2',
                  error ? 'border-error' : 'border-gray-300'
                )}
                animate={
                  value === option.value
                    ? { scale: [1, 1.1, 1], borderColor: '#00A3E0' }
                    : { scale: 1 }
                }
                transition={{ duration: 0.2 }}
              >
                {value === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-2.5 h-2.5 rounded-full bg-accent"
                  />
                )}
              </motion.div>
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;

