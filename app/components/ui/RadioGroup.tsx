'use client';

import { forwardRef, useId } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { FV_DANGER_VARS, FV_ERROR, FV_LABEL } from '@/app/components/fv/field';

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

// Public-only control (admin does not import it) — themed in place with fv tokens.
const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ label, name, options, value, onChange, error, className }, ref) => {
    const labelId = useId();
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        className={clsx('w-full', className)}
        style={error ? FV_DANGER_VARS : undefined}
      >
        {label && (
          <span id={labelId} className={FV_LABEL}>
            {label}
          </span>
        )}
        <div className="space-y-2.5">
          {options.map((option) => (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center"
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className="peer sr-only"
              />
              <motion.div
                className={clsx(
                  'flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 bg-white',
                  'transition-colors duration-200',
                  'peer-checked:border-fv-blue-d peer-focus-visible:ring-2 peer-focus-visible:ring-fv-blue-d peer-focus-visible:ring-offset-2',
                  error ? 'border-[var(--c)]' : 'border-fv-muted group-hover:border-fv-blue-d'
                )}
                animate={value === option.value ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {value === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.15 }}
                    className="h-2.5 w-2.5 rounded-full bg-fv-blue-d"
                  />
                )}
              </motion.div>
              <span className="ml-2.5 text-[15px] text-fv-slate group-hover:text-fv-navy peer-checked:font-medium peer-checked:text-fv-navy">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        {error && <p className={FV_ERROR}>{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
