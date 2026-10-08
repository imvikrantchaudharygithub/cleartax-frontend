import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import IconTileByName from '@/app/components/fv/IconTileByName';
import SolutionHero from '@/app/components/solutions/SolutionHero';
import SolutionPlanner from '@/app/components/solutions/SolutionPlanner';
import { isFvColor } from '@/app/lib/fv/colors';
import { fetchSolution } from '@/app/lib/solutions/publicApi';

export const revalidate = 300;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const solution = await fetchSolution(slug);
  if (!solution) return { title: 'Solution not found', robots: { index: false } };
  return {
    title: solution.title,
    description: solution.pageDescription || solution.subtitle || `${solution.title} — expert services by FinVidhi`,
    alternates: { canonical: `/solutions/${solution.slug}` },
  };
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const solution = await fetchSolution(slug);
  if (!solution) notFound();

  // Service icons are DB names. Resolve them here, on the server, and hand the planner (a client
  // component) rendered tiles: resolving them in the browser would ship lucide's whole namespace.
  const color = isFvColor(solution.color) ? solution.color : 'blue';
  const icons: Record<string, ReactNode> = {};
  for (const item of solution.sections.flatMap((section) => section.items)) {
    icons[item.id] ??= <IconTileByName name={item.iconName} color={color} size="sm" />;
  }

  return (
    <>
      <SolutionHero solution={solution} />
      <SolutionPlanner solution={solution} icons={icons} />
    </>
  );
}
