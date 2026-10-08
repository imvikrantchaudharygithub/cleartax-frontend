import type { LucideIcon } from 'lucide-react';
import { Search } from 'lucide-react';
import LightHero from '../fv/LightHero';
import IconTileByName from '../fv/IconTileByName';
import { colorAt } from '@/app/lib/fv/colors';

interface CategoryHeroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  breadcrumb: { label: string; href?: string }[];
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  stats: { label: string; iconName: string }[];
}

/** Light L3 hero shared by category pages and subcategory listings (rendered inside client pages). */
export default function CategoryHero({
  title,
  description,
  icon,
  breadcrumb,
  searchLabel,
  searchValue,
  onSearchChange,
  stats,
}: CategoryHeroProps) {
  return (
    <LightHero
      title={title}
      subtitle={description}
      icon={icon}
      breadcrumb={breadcrumb}
      align="left"
      aside={
        stats.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <li key={`${stat.label}-${i}`} className="fv-card flex items-center gap-3 p-4">
                <IconTileByName name={stat.iconName} color={colorAt(i)} size="sm" />
                <span className="text-sm font-semibold leading-snug text-fv-navy">{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : undefined
      }
    >
      <div className="relative max-w-[520px]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-fv-muted" aria-hidden="true" />
        <label htmlFor="category-search" className="sr-only">
          {searchLabel}
        </label>
        <input
          id="category-search"
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchLabel}
          className="w-full rounded-xl border border-fv-line bg-white py-3 pl-11 pr-4 text-base text-fv-navy shadow-fv-card outline-none placeholder:text-fv-muted focus:border-fv-blue-d focus:ring-2 focus:ring-fv-blue-d focus-visible:outline-none"
        />
      </div>
    </LightHero>
  );
}
