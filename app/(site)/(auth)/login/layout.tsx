import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Log in to your FinVidhi account to manage your tax, GST and compliance services.',
  alternates: { canonical: '/login' },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
