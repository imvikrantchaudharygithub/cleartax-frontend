'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { clsx } from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current && isFocused) {
        gsap.to(containerRef.current.querySelector('textarea'), {
          borderColor: '#00A3E0',
          duration: 0.2,
          ease: 'power2.out',
        });
      } else if (containerRef.current) {
        gsap.to(containerRef.current.querySelector('textarea'), {
          borderColor: error ? '#E74C3C' : '#d1d5db',
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }, [isFocused, error]);

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div ref={containerRef} className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={clsx(
            'w-full px-4 py-3 border border-gray-300 rounded-lg',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-all duration-200 resize-none',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error',
            className
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;

