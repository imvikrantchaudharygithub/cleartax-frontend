'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixIcon, suffixIcon, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);

    useEffect(() => {
      if (labelRef.current && isFocused) {
        gsap.to(labelRef.current, {
          y: -8,
          scale: 0.85,
          color: '#00A3E0',
          duration: 0.2,
          ease: 'power2.out',
        });
      } else if (labelRef.current && !props.value) {
        gsap.to(labelRef.current, {
          y: 0,
          scale: 1,
          color: '#6b7280',
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }, [isFocused, props.value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div ref={containerRef} className="w-full">
        {label && (
          <label
            ref={labelRef}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full px-4 py-3 border border-gray-300 rounded-lg',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
              'transition-all duration-200',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error && 'border-error focus:border-error focus:ring-error',
              prefixIcon && 'pl-10',
              suffixIcon && 'pr-10',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

