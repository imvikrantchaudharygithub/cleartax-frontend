'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { itemVariants } from '@/app/lib/animations/staggerConfig';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Render light-on-dark (for use over the brand mesh background). */
  dark?: boolean;
}

export default function Breadcrumb({ items, dark = false }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center space-x-2 text-sm"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className={`w-4 h-4 mx-2 ${dark ? 'text-white/40' : 'text-gray-400'}`} />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className={dark
                ? 'text-white/70 hover:text-white transition-colors'
                : 'text-gray-600 hover:text-accent transition-colors'}
            >
              {item.label}
            </Link>
          ) : (
            <span className={dark ? 'text-white font-medium' : 'text-gray-900 font-medium'}>{item.label}</span>
          )}
        </div>
      ))}
    </motion.nav>
  );
}

