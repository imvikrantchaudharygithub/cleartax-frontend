'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';

/**
 * Site-wide framer-motion policy: reducedMotion="user" makes every motion component on public
 * pages honour the OS "reduce motion" setting (transform/layout animations jump to their final
 * state). Lets (site)/layout.tsx stay a server component.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
