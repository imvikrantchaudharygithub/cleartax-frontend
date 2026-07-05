import type { Metadata } from 'next'
import { formatCategoryTitle } from '@/app/lib/utils/formatCategoryTitle'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const postTitle = formatCategoryTitle(slug.replace(/-/g, ' '))
  return {
    // The parent /blog layout sets a string title, which stops the root
    // template from cascading — so the suffix is added explicitly here.
    title: { absolute: `${postTitle} | FinVidhi` },
    description: `Read "${postTitle}" on the FinVidhi blog — practical tax, GST and compliance guidance for Indian businesses.`,
    alternates: { canonical: `/blog/${slug}` },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
