'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { clsx } from 'clsx';
import { FV_DANGER_VARS, FV_ERROR, FV_LABEL } from '@/app/components/fv/field';

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

// Public-only control (admin does not import it) — themed in place with fv tokens.
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
  const inputId = useId();

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
    <div className={clsx('w-full', className)} style={error ? FV_DANGER_VARS : undefined}>
      {label && (
        <label htmlFor={inputId} className={FV_LABEL}>
          {label}
        </label>
      )}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm text-fv-slate">
          {prefix}{min.toLocaleString()}{suffix}
        </span>
        <span className="rounded-full bg-fv-blue-50 px-2.5 py-0.5 text-base font-bold text-fv-blue-d">
          {prefix}{value.toLocaleString()}{suffix}
        </span>
        <span className="text-sm text-fv-slate">
          {prefix}{max.toLocaleString()}{suffix}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 rounded-full bg-fv-line">
          <div
            className="h-full rounded-full bg-fv-blue-d transition-all duration-200 motion-reduce:transition-none"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {/* Native range input (invisible) drives the value; taller than the track for an easier hit area. */}
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-valuetext={`${prefix}${value.toLocaleString()}${suffix}`}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="peer absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2 cursor-pointer opacity-0"
        />
        <div
          ref={thumbRef}
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-fv-blue-d bg-white shadow-fv-btn peer-focus-visible:ring-2 peer-focus-visible:ring-fv-blue-d peer-focus-visible:ring-offset-2"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      {error && <p className={FV_ERROR}>{error}</p>}
    </div>
  );
}
