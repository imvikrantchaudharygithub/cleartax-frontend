import type { Metadata } from 'next'

// Wraps both /blog and /blog/[slug]. No canonical here — it would cascade to
// every post. Individual posts should set their own metadata (client page today;
// convert to a server component with generateMetadata for full per-post SEO).
export const metadata: Metadata = {
  title: 'Blog — Tax, GST & Compliance Insights',
  description:
    'Practical guides and updates on GST, income tax, compliance deadlines, and business regulation in India from the FinVidhi team.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
