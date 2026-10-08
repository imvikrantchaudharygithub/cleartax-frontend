import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Clock, FileText } from 'lucide-react';
import IconTile from '../fv/IconTile';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { formatFromPrice } from '@/app/lib/fv/text';

interface ServiceCardProps {
  title: string;
  shortDescription: string;
  /** Omit when passing from Server Component; use iconName instead. */
  icon?: LucideIcon;
  iconName?: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  slug: string;
  category: string;
  subcategory?: string; // Optional subcategory for complex categories
}

export default function ServiceCard({
  title,
  shortDescription,
  icon: IconProp,
  iconName,
  price,
  duration,
  slug,
  category,
  subcategory,
}: ServiceCardProps) {
  const Icon = IconProp ?? (iconName ? getIconFromName(iconName) : FileText);
  const href = subcategory
    ? `/services/${category.toLowerCase()}/${subcategory}/${slug}`
    : `/services/${category.toLowerCase()}/${slug}`;
  const fromPrice = formatFromPrice(price);

  return (
    <Link
      href={href}
      className="group fv-card relative flex h-full flex-col p-5 transition duration-200 hover:border-[#CFE2F2] hover:shadow-fv-raised motion-safe:hover:-translate-y-0.5"
    >
      <IconTile icon={Icon as LucideIcon} />
      <h3 className="mt-4 text-base font-bold leading-snug text-fv-navy group-hover:text-fv-blue-d">{title}</h3>
      <p className="mb-4 mt-1.5 line-clamp-2 text-sm leading-relaxed text-fv-slate">{shortDescription}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-fv-line pt-4 text-[13px] text-fv-slate">
        {fromPrice ? (
          <span>
            From <b className="text-[15px] font-extrabold text-fv-navy">{fromPrice}</b>
          </span>
        ) : (
          <b className="font-semibold text-fv-navy">Price on request</b>
        )}
        {duration && duration !== 'N/A' && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {duration}
          </span>
        )}
      </div>
    </Link>
  );
}
