'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

// Helper function to check if element is in viewport
function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  // Check if element is already visible (within 85% of viewport from top)
  return rect.top < windowHeight * 0.85 && rect.bottom > 0;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    let animation: gsap.core.Tween | null = null;

    // Set initial state based on direction
    const initialState: gsap.TweenVars = { opacity: 0 };
    const animateState: gsap.TweenVars = { opacity: 1 };

    switch (direction) {
      case 'up':
        initialState.y = distance;
        animateState.y = 0;
        break;
      case 'down':
        initialState.y = -distance;
        animateState.y = 0;
        break;
      case 'left':
        initialState.x = distance;
        animateState.x = 0;
        break;
      case 'right':
        initialState.x = -distance;
        animateState.x = 0;
        break;
      case 'fade':
        // Only fade, no movement
        break;
    }

    // Check visibility synchronously after DOM is ready
    Promise.resolve().then(() => {
      const alreadyVisible = isInViewport(element);

      if (alreadyVisible) {
        // If already visible, set final state immediately (no animation to avoid flash)
        gsap.set(element, animateState);
      } else {
        // If not visible, set initial state and wait for scroll
        gsap.set(element, initialState);

        animation = gsap.to(element, {
          ...animateState,
          duration,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            once: true,
            toggleActions: 'play none none none',
          },
        });
      }
    });

    // Cleanup function
    return () => {
      if (animation) {
        animation.kill();
      }
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [direction, delay, duration, distance]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

