'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatNumber, formatCurrency, formatNumberWithSuffix } from '@/app/lib/animations/counterConfig';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface CounterAnimationProps {
  end: number;
  start?: number;
  duration?: number;
  format?: 'number' | 'currency' | 'suffix' | 'percentage';
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}

export default function CounterAnimation({
  end,
  start = 0,
  duration = 2,
  format = 'number',
  suffix = '',
  prefix = '',
  className,
  decimals = 0,
}: CounterAnimationProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!counterRef.current || hasAnimated) return;

    const element = counterRef.current;
    const obj = { value: start };

    const formatValue = (value: number): string => {
      let formatted: string;

      switch (format) {
        case 'currency':
          formatted = formatCurrency(Math.round(value));
          break;
        case 'suffix':
          formatted = formatNumberWithSuffix(value);
          break;
        case 'percentage':
          formatted = `${value.toFixed(decimals)}%`;
          break;
        case 'number':
        default:
          formatted = decimals > 0
            ? value.toFixed(decimals)
            : formatNumber(Math.round(value));
          break;
      }

      return `${prefix}${formatted}${suffix}`;
    };

    element.textContent = formatValue(start);

    const animation = gsap.to(obj, {
      value: end,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        element.textContent = formatValue(obj.value);
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
        once: true,
        onEnter: () => setHasAnimated(true),
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [end, start, duration, format, suffix, prefix, decimals, hasAnimated]);

  return <span ref={counterRef} className={className}>{start}</span>;
}

