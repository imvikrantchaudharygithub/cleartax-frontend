'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { clsx } from 'clsx';

interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  prefix?: string;
  error?: string;
  className?: string;
}

export default function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  suffix = '',
  prefix = '',
  error,
  className,
}: RangeSliderProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (thumbRef.current) {
      if (isDragging) {
        gsap.to(thumbRef.current, {
          scale: 1.3,
          duration: 0.2,
          ease: 'power2.out',
        });
      } else {
        gsap.to(thumbRef.current, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">
          {prefix}{min.toLocaleString()}{suffix}
        </span>
        <span className="text-base font-semibold text-accent">
          {prefix}{value.toLocaleString()}{suffix}
        </span>
        <span className="text-sm text-gray-600">
          {prefix}{max.toLocaleString()}{suffix}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-accent rounded-full transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div
          ref={thumbRef}
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-accent rounded-full shadow-md pointer-events-none"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error animate-shake">{error}</p>
      )}
    </div>
  );
}

