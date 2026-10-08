import { CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import IconTile from '../fv/IconTile';

interface ServiceFeaturesProps {
  features: string[];
  benefits?: string[];
}

export default function ServiceFeatures({ features, benefits }: ServiceFeaturesProps) {
  const lists = [
    { title: "What's Included", items: features ?? [], color: 'blue' as const },
    { title: 'Key Benefits', items: benefits ?? [], color: 'green' as const },
  ].filter((list) => list.items.length > 0);

  return (
    <div className={clsx('grid gap-5', lists.length > 1 && 'md:grid-cols-2')}>
      {lists.map((list) => (
        <div key={list.title} className="fv-card p-6">
          <h3 className="flex items-center gap-3 text-lg font-bold text-fv-navy">
            <IconTile icon={CheckCircle} color={list.color} size="sm" />
            {list.title}
          </h3>
          <ul className="mt-4 space-y-3">
            {list.items.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[15px] leading-relaxed text-fv-slate">
                <CheckCircle
                  aria-hidden="true"
                  className={clsx('mt-0.5 h-5 w-5 flex-none', list.color === 'green' ? 'text-fv-green' : 'text-fv-blue')}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
