'use client';

import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { FV_CONTROL, FV_CONTROL_ERROR, FV_DANGER_VARS, FV_ERROR, FV_LABEL } from './field';

/**
 * Public-site twin of the admin-shared ui Input (admin keeps it). Same props, forwardRef and
 * default export, so imports swap unchanged; themed per spec rule 5.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixIcon, suffixIcon, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full" style={error ? FV_DANGER_VARS : undefined}>
        {label && (
          <label htmlFor={inputId} className={FV_LABEL}>
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fv-slate">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={clsx(FV_CONTROL, error && FV_CONTROL_ERROR, prefixIcon && 'pl-10', suffixIcon && 'pr-10', className)}
            {...props}
          />
          {suffixIcon && (
            // Not pointer-events-none: callers put buttons here (password show/hide).
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-fv-slate">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={errorId} role="alert" className={FV_ERROR}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
