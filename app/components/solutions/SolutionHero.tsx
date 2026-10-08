import Breadcrumb from '@/app/components/common/Breadcrumb';
import IconTileByName from '@/app/components/fv/IconTileByName';
import { LIGHT_HERO_BG } from '@/app/components/fv/LightHero';
import { isFvColor } from '@/app/lib/fv/colors';
import { formatINR, splitHeading } from '@/app/lib/fv/text';
import type { SolutionDetail } from '@/app/lib/api/types';

// s3 `.bigic`: the same glossy light → colour → dark tile as the home rail, so the icon a visitor
// tapped on the rail is the one that greets them here.
const HERO_TILE =
  '!bg-[linear-gradient(145deg,color-mix(in_srgb,var(--c)_65%,#fff),var(--c)_50%,color-mix(in_srgb,var(--c)_75%,#000))] ' +
  '!shadow-[0_16px_30px_color-mix(in_srgb,var(--c)_35%,transparent)]';

/** Solution page hero (design 3 `.p3h`). Server component: the icon name resolves here. */
export default function SolutionHero({ solution }: { solution: SolutionDetail }) {
  const color = isFvColor(solution.color) ? solution.color : 'blue';
  const [line1, line2] = splitHeading(solution.pageHeading || solution.title);
  const { serviceCount, startingPrice, sectionCount } = solution.stats;
  const stats = [
    { value: String(serviceCount), label: serviceCount === 1 ? 'service' : 'services' },
    ...(startingPrice > 0 ? [{ value: formatINR(startingPrice), label: 'starting price' }] : []),
    { value: String(sectionCount), label: sectionCount === 1 ? 'step' : 'steps' },
  ];

  return (
    <section className={`border-b border-fv-line ${LIGHT_HERO_BG}`}>
      <div className="fv-wrap pb-9 pt-10 text-center">
        <Breadcrumb
          className="mb-5 [&>ol]:justify-center"
          items={[{ label: 'Home', href: '/' }, { label: 'Solutions', href: '/#solutions' }, { label: solution.title }]}
        />
        <IconTileByName name={solution.iconName} color={color} size="xl" solid className={`mx-auto mb-4 ${HERO_TILE}`} />
        <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-[-0.03em] text-fv-navy md:text-[46px]">
          {line1}
          {line2 && (
            <>
              <br />
              <span className="text-fv-blue">{line2}</span>
            </>
          )}
        </h1>
        {solution.pageDescription && (
          <p className="mx-auto mt-3 max-w-[620px] text-base leading-relaxed text-fv-slate md:text-[17px]">
            {solution.pageDescription}
          </p>
        )}
        {serviceCount > 0 && (
          <ul className="mx-auto mt-6 flex max-w-[520px] flex-wrap justify-center gap-3">
            {stats.map((stat) => (
              <li key={stat.label} className="fv-card min-w-[96px] px-4 py-2.5">
                <span className="block text-xl font-extrabold leading-tight text-fv-navy">{stat.value}</span>
                <span className="block text-xs text-fv-slate">{stat.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
