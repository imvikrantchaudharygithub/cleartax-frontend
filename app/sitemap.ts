import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://finvidhi.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.finvidhi.com/api'

// Static, always-available public routes.
const STATIC_PATHS = [
  '',
  '/services',
  '/calculators',
  '/calculators/income-tax',
  '/calculators/gst',
  '/calculators/emi',
  '/calculators/hra',
  '/calculators/tds',
  '/compliance',
  '/blog',
  '/team',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  // Static GST service pages
  '/services/gst/registration',
  '/services/gst/return-filing',
  '/services/gst/annual-return',
  '/services/gst/e-invoicing',
  '/services/gst/amendment',
  '/services/gst/lut',
  '/services/gst/nil-return',
  '/services/gst/revocation',
]

/** Defensively extract an array of items from the API's { success, data } envelope. */
function asArray(json: unknown): any[] {
  if (Array.isArray(json)) return json
  if (json && typeof json === 'object') {
    const data = (json as { data?: unknown }).data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return (data as { items: any[] }).items
    }
  }
  return []
}

async function fetchJson(path: string): Promise<unknown> {
  const res = await fetch(`${API_URL}${path}`, {
    // Revalidate daily so new content is picked up without a redeploy.
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`sitemap fetch ${path} -> ${res.status}`)
  return res.json()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.7,
  }))

  const dynamicEntries: MetadataRoute.Sitemap = []

  // Blog posts — resilient: any failure just omits dynamic blog URLs.
  try {
    const blogs = asArray(await fetchJson('/blog?limit=1000'))
    for (const post of blogs) {
      if (post?.slug) {
        dynamicEntries.push({
          url: `${SITE_URL}/blog/${post.slug}`,
          lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  } catch {
    // ignore — static blog index still present
  }

  return [...staticEntries, ...dynamicEntries]
}
