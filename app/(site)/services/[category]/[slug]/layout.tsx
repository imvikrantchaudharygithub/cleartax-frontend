import type { Metadata } from 'next'
import { formatCategoryTitle } from '@/app/lib/utils/formatCategoryTitle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params
  const serviceName = formatCategoryTitle(slug.replace(/-/g, ' '))
  return {
    title: serviceName,
    description: `${serviceName} with FinVidhi — expert-assisted, fast and fully compliant. Get started today.`,
    alternates: { canonical: `/services/${category}/${slug}` },
  }
}

export default function ServiceSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
