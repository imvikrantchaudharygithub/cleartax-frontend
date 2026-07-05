import type { Metadata } from 'next'
import { formatCategoryTitle } from '@/app/lib/utils/formatCategoryTitle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string; serviceSlug: string }>
}): Promise<Metadata> {
  const { category, slug, serviceSlug } = await params
  const serviceName = formatCategoryTitle(serviceSlug.replace(/-/g, ' '))
  return {
    title: serviceName,
    description: `${serviceName} with FinVidhi — expert-assisted, fast and fully compliant. Get started today.`,
    alternates: { canonical: `/services/${category}/${slug}/${serviceSlug}` },
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
