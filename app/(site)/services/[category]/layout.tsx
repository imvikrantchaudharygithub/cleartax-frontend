import type { Metadata } from 'next'
import { formatCategoryTitle } from '@/app/lib/utils/formatCategoryTitle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const categoryName = formatCategoryTitle(category.replace(/-/g, ' '))
  return {
    // Re-declare the template so child segments ([slug], [serviceSlug]) keep
    // the "| FinVidhi" suffix.
    title: {
      default: `${categoryName} Services`,
      template: '%s | FinVidhi',
    },
    description: `Explore FinVidhi's ${categoryName} services — expert-assisted, fast and fully compliant solutions for Indian businesses.`,
    alternates: { canonical: `/services/${category}` },
  }
}

export default function ServiceCategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
