import Link from 'next/link';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

const BASE =
  'inline-flex items-center rounded-full border border-fv-line bg-white px-3 py-1.5 text-[13px] font-semibold text-fv-navy';

export default function Pill({ children, href, className }: { children: ReactNode; href?: string; className?: string }) {
  if (href) {
    return (
      <Link href={href} className={clsx(BASE, 'transition-colors hover:border-fv-blue hover:text-fv-blue-d', className)}>
        {children}
      </Link>
    );
  }
  return <span className={clsx(BASE, className)}>{children}</span>;
}
