import Link from 'next/link';
import IntentLink from './IntentLink';
import { isIntentOnlyHref } from '@/app/lib/fv/intent';
import { clsx } from 'clsx';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Public-site button. Same props as ui/Button (primary | secondary | tertiary, size,
 * isLoading) so imports can be swapped; admin keeps ui/Button (spec D4).
 * NOTE: no default `type` — like ui/Button, it submits when placed in a <form>.
 */
export type FvButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'white' | 'link';
export type FvButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 cursor-pointer ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fv-blue-d focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<FvButtonVariant, string> = {
  primary: 'bg-fv-blue-d text-white shadow-fv-btn hover:bg-fv-blue-dd',
  secondary: 'bg-fv-navy text-white hover:bg-[#16224A]',
  tertiary: 'border border-fv-blue-d bg-white text-fv-blue-d hover:bg-fv-blue-50',
  outline: 'border border-fv-blue-d bg-white text-fv-blue-d hover:bg-fv-blue-50',
  white: 'border border-fv-line bg-white text-fv-navy hover:bg-fv-wash',
  link: 'text-fv-blue-d underline-offset-4 hover:text-fv-blue-dd hover:underline',
};

const SIZES: Record<FvButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[15px]',
  lg: 'px-6 py-3.5 text-base',
};

export function fvButtonClass(variant: FvButtonVariant = 'primary', size: FvButtonSize = 'md', className?: string) {
  return clsx(BASE, VARIANTS[variant], variant !== 'link' && SIZES[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FvButtonVariant;
  size?: FvButtonSize;
  isLoading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={fvButtonClass(variant, size, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: FvButtonVariant;
  size?: FvButtonSize;
  children: ReactNode;
}

/** Link styled as a button. External / tel: / mailto: hrefs render a plain <a>. */
export function ButtonLink({ href, variant = 'primary', size = 'md', className, children, ...props }: ButtonLinkProps) {
  const cls = fvButtonClass(variant, size, className);
  if (/^(https?:|tel:|mailto:)/.test(href)) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    );
  }
  // /services* pulls a heavy icon chunk: prefetch on intent only.
  const LinkComponent = isIntentOnlyHref(href) ? IntentLink : Link;
  return (
    <LinkComponent href={href} className={cls} {...props}>
      {children}
    </LinkComponent>
  );
}
