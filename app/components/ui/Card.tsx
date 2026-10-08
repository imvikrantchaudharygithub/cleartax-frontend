import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'fv-card p-6 transition duration-200',
        hoverable && 'cursor-pointer hover:border-[#CFE2F2] hover:shadow-fv-raised motion-safe:hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}
