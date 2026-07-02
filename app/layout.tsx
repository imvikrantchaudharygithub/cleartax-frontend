import type { Metadata } from 'next'
import { Inter, Poppins, IBM_Plex_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex',
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://finvidhi.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FinVidhi - Your Complete Tax & Compliance Solution',
    template: '%s | FinVidhi',
  },
  description:
    'Calculate, Comply, and Save with Confidence. Professional tax calculators, GST & income tax services, compliance tracking, and expert guidance for Indian businesses.',
  keywords: [
    'tax filing India',
    'GST registration',
    'income tax calculator',
    'compliance',
    'GST return filing',
    'business registration',
    'trademark registration',
    'FinVidhi',
  ],
  applicationName: 'FinVidhi',
  authors: [{ name: 'FinVidhi' }],
  // No global canonical: setting one here would cascade to every route that
  // doesn't override it. Canonicals are set per-page on leaf routes only.
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'FinVidhi',
    title: 'FinVidhi - Your Complete Tax & Compliance Solution',
    description:
      'Professional tax calculators, GST & income tax services, compliance tracking, and expert guidance for Indian businesses.',
    images: [{ url: '/apple-icon.png', width: 512, height: 512, alt: 'FinVidhi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinVidhi - Your Complete Tax & Compliance Solution',
    description:
      'Professional tax calculators, GST & income tax services, compliance tracking, and expert guidance for Indian businesses.',
    images: ['/apple-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'FinVidhi',
        url: SITE_URL,
        logo: `${SITE_URL}/apple-icon.png`,
        description:
          'Modern finance and tax compliance firm offering taxation, GST, audit, and compliance services for Indian businesses.',
        areaServed: 'IN',
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'FinVidhi',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
      },
    ],
  }

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${ibmPlexSans.variable}`}>
      <body className="font-sans antialiased">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E2C59',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#58A651',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
