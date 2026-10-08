import type { ComponentType, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import LightHero from '@/app/components/fv/LightHero';

/** Shared inner-page hero, now the light L3 hero (spec D4). Props unchanged. */
interface PageHeroProps {
  title: string;
  subtitle?: string;
  icon?: ComponentType<{ className?: string }>;
  /** Optional extra content rendered under the subtitle (search bar, filters). */
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, icon, children }: PageHeroProps) {
  return (
    <LightHero title={title} subtitle={subtitle} icon={icon as LucideIcon | undefined}>
      {children}
    </LightHero>
  );
}
