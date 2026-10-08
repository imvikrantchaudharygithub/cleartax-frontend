import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { fvButtonClass } from './Button';

interface SearchBarProps {
  id?: string;
  placeholder?: string;
  defaultValue?: string;
  /** `lg` = home hero search (58px, 52px and no button below 640px; Enter still submits). */
  size?: 'md' | 'lg';
  className?: string;
}

export default function SearchBar({
  id = 'fv-search',
  placeholder = 'Search for a service (e.g. GST, Company Registration)',
  defaultValue,
  size = 'md',
  className,
}: SearchBarProps) {
  const lg = size === 'lg';
  return (
    <form
      action="/services"
      method="get"
      role="search"
      className={clsx(
        'flex w-full items-center gap-2 border border-fv-line bg-white shadow-fv-card',
        // The only focus indicator: fv-blue-d (5.6:1 on white) border + 2px ring around the whole bar.
        'focus-within:border-fv-blue-d focus-within:ring-2 focus-within:ring-fv-blue-d',
        lg ? 'h-[52px] rounded-[14px] pl-4 pr-2 sm:h-[58px]' : 'rounded-xl p-1.5 pl-4',
        className,
      )}
    >
      <Search className="h-5 w-5 flex-none text-fv-muted" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        Search services
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent py-2 text-base text-fv-navy outline-none placeholder:text-fv-muted focus-visible:outline-none"
      />
      <button type="submit" className={fvButtonClass('primary', 'md', clsx('flex-none', lg && 'max-sm:hidden'))}>
        Search
      </button>
    </form>
  );
}
