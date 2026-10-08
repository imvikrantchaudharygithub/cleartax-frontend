import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  soft?: boolean;
  tight?: boolean;
  id?: string;
  className?: string;
  innerClassName?: string;
  'aria-labelledby'?: string;
}

export default function Section({ children, soft, tight, id, className, innerClassName, ...rest }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={rest['aria-labelledby']}
      className={clsx(soft ? 'bg-fv-wash' : 'bg-white', tight ? 'py-12 md:py-14' : 'py-14 md:py-[88px]', className)}
    >
      <div className={clsx('fv-wrap', innerClassName)}>{children}</div>
    </section>
  );
}
