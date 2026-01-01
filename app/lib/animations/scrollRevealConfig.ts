import { gsap } from 'gsap';

export interface ScrollRevealConfig {
  trigger: string | HTMLElement;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  markers?: boolean;
  toggleActions?: string;
}

// Parallax effect configuration
export const parallaxConfig = {
  start: 'top bottom',
  end: 'bottom top',
  scrub: 1,
  ease: 'none',
};

// Stagger animation configuration
export const staggerConfig = {
  start: 'top 80%',
  toggleActions: 'play none none reverse',
  stagger: {
    amount: 0.8,
    from: 'start',
  },
};

// Counter animation configuration
export const counterConfig = {
  start: 'top 75%',
  toggleActions: 'play none none none',
};

// Fade in from bottom
export const fadeInUpConfig = {
  start: 'top 85%',
  toggleActions: 'play none none reverse',
  y: 50,
  opacity: 0,
  duration: 0.8,
  ease: 'power2.out',
};

// Slide in from left
export const slideInLeftConfig = {
  start: 'top 80%',
  toggleActions: 'play none none reverse',
  x: -100,
  opacity: 0,
  duration: 1,
  ease: 'power3.out',
};

// Slide in from right
export const slideInRightConfig = {
  start: 'top 80%',
  toggleActions: 'play none none reverse',
  x: 100,
  opacity: 0,
  duration: 1,
  ease: 'power3.out',
};

// Scale up animation
export const scaleUpConfig = {
  start: 'top 80%',
  toggleActions: 'play none none reverse',
  scale: 0.8,
  opacity: 0,
  duration: 0.8,
  ease: 'back.out(1.4)',
};

// Timeline stagger
export const timelineStaggerConfig = {
  start: 'top 70%',
  toggleActions: 'play none none reverse',
};

