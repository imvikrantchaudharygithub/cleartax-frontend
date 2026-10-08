import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { formatStatValue, type StatLike } from '@/app/lib/fv/text';

interface StatItem extends StatLike {
  icon?: string;
}

export default function StatsStrip({ items }: { items: StatItem[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="FinVidhi in numbers" className="border-b border-fv-line bg-white">
      <div className="fv-wrap grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.slice(0, 4).map((stat, i) => {
          const Icon = getIconFromName(stat.icon);
          return (
            <div key={`${stat.label}-${i}`} className="flex items-center gap-3 lg:justify-center">
              <Icon className="h-8 w-8 flex-none text-fv-blue" strokeWidth={1.6} aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-2xl font-extrabold leading-tight text-fv-navy md:text-[28px]">{formatStatValue(stat)}</div>
                <div className="text-sm text-fv-slate">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
