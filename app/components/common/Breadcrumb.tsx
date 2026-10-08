import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Light-on-dark variant (kept for compatibility). */
  dark?: boolean;
  className?: string;
}

export default function Breadcrumb({ items, dark = false, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={clsx('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRight aria-hidden="true" className={clsx('mx-1.5 h-4 w-4', dark ? 'text-white/40' : 'text-fv-muted')} />
            )}
            {item.href ? (
              <Link href={item.href} className={dark ? 'text-white/70 hover:text-white' : 'text-fv-slate hover:text-fv-blue-d'}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className={clsx('font-semibold', dark ? 'text-white' : 'text-fv-navy')}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
