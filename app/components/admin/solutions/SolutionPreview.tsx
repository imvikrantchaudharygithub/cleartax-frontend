import IconTileByName from '@/app/components/fv/IconTileByName';
import { plural, splitHeading } from '@/app/lib/fv/text';
import type { FvColor } from '@/app/lib/fv/colors';

interface SolutionPreviewProps {
  title: string;
  subtitle: string;
  iconName: string;
  color: FvColor;
  heading: string;
  description: string;
  serviceCount: number;
}

// The public look without the `fv-site` class: globals.css has `body:has(.fv-site)`, which would
// switch the whole admin page's fonts to Inter while the preview is on screen.
const SITE_TYPE = '[font-family:var(--font-inter),system-ui,sans-serif] text-fv-navy';

/** Renders public-site styles inside the dark admin so admins see the real look. */
export default function SolutionPreview({ title, subtitle, iconName, color, heading, description, serviceCount }: SolutionPreviewProps) {
  const [line1, line2] = splitHeading(heading);
  return (
    <aside aria-label="Live preview" className="space-y-3 xl:sticky xl:top-6 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Live preview · home rail</p>
      <div className={`${SITE_TYPE} rounded-xl bg-white p-6 text-center`}>
        <IconTileByName name={iconName} color={color} size="xl" solid className="mx-auto" />
        <p className="mt-3 text-[15px] font-bold text-fv-navy">{title || 'Solution title'}</p>
        <p className="text-[13px] text-fv-slate">{plural(serviceCount, 'service')}</p>
        {subtitle && <p className="mt-2 text-xs text-fv-slate">{subtitle}</p>}
      </div>
      <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Live preview · page header</p>
      <div className={`${SITE_TYPE} rounded-xl bg-[linear-gradient(180deg,#F3F9FD,#ffffff)] p-6 text-center`}>
        <IconTileByName name={iconName} color={color} size="lg" solid className="mx-auto" />
        <p className="mt-3 text-xl font-extrabold leading-tight text-fv-navy">
          {line1 || 'Page heading'}
          {line2 && (
            <>
              <br />
              <span className="text-fv-blue">{line2}</span>
            </>
          )}
        </p>
        {description && <p className="mt-2 text-sm text-fv-slate">{description}</p>}
      </div>
      <p className="text-xs leading-relaxed text-gray-500">
        Prices and timelines aren&apos;t typed here. They come from each service, so a price change in Services shows up everywhere.
      </p>
    </aside>
  );
}
