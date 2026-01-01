import { gsap } from 'gsap';

export interface CounterAnimationOptions {
  duration?: number;
  ease?: string;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
}

/**
 * Animates a number from start to end value
 * @param element - DOM element or ref to update
 * @param endValue - Target number
 * @param options - Animation options
 */
export function animateCounter(
  element: HTMLElement | null,
  endValue: number,
  options: CounterAnimationOptions = {}
): gsap.core.Tween | null {
  if (!element) return null;

  const {
    duration = 2,
    ease = 'power2.out',
    onUpdate,
    onComplete,
  } = options;

  const obj = { value: 0 };

  return gsap.to(obj, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      const currentValue = Math.round(obj.value);
      element.textContent = formatNumber(currentValue);
      if (onUpdate) onUpdate(currentValue);
    },
    onComplete,
  });
}

/**
 * Formats a number with Indian number system
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

/**
 * Formats currency in Indian Rupees
 */
export function formatCurrency(num: number): string {
  return `₹${num.toLocaleString('en-IN')}`;
}

/**
 * Formats number with suffix (K, M, Cr, etc.)
 */
export function formatNumberWithSuffix(num: number): string {
  if (num >= 10000000) {
    // 1 Crore
    return `₹${(num / 10000000).toFixed(1)}Cr+`;
  } else if (num >= 100000) {
    // 1 Lakh
    return `₹${(num / 100000).toFixed(1)}L+`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K+`;
  }
  return num.toString();
}

/**
 * Animates percentage counter
 */
export function animatePercentage(
  element: HTMLElement | null,
  endValue: number,
  options: CounterAnimationOptions = {}
): gsap.core.Tween | null {
  if (!element) return null;

  const {
    duration = 1.5,
    ease = 'power2.out',
    onUpdate,
    onComplete,
  } = options;

  const obj = { value: 0 };

  return gsap.to(obj, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      const currentValue = obj.value.toFixed(1);
      element.textContent = `${currentValue}%`;
      if (onUpdate) onUpdate(obj.value);
    },
    onComplete,
  });
}

/**
 * Stagger counter animations for multiple elements
 */
export function animateCounters(
  elements: (HTMLElement | null)[],
  values: number[],
  options: CounterAnimationOptions & { stagger?: number } = {}
): gsap.core.Timeline {
  const timeline = gsap.timeline();
  const stagger = options.stagger || 0.2;

  elements.forEach((element, index) => {
    if (element && values[index] !== undefined) {
      const tween = animateCounter(element, values[index], options);
      if (tween) {
        timeline.add(tween, index * stagger);
      }
    }
  });

  return timeline;
}

