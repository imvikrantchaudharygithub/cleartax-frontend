import Navigation, { type NavSolution } from '../components/common/Navigation'
import Footer from '../components/common/Footer'
import MotionProvider from '../components/fv/MotionProvider'
import { fetchPublishedSolutions } from '../lib/solutions/publicApi'
import { getIconFromName } from '../lib/utils/apiDataConverter'
import { isFvColor } from '../lib/fv/colors'

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ISR fetch (revalidate 300, no cookies()/headers()) so public pages stay static (A5). Icon
  // names are resolved HERE, on the server, and handed to the client nav as rendered elements
  // (A2): resolving them in Navigation would ship the whole lucide namespace on every page.
  const solutions = await fetchPublishedSolutions()
  const navSolutions: NavSolution[] = solutions.map((s) => {
    const Icon = getIconFromName(s.iconName)
    return {
      slug: s.slug,
      title: s.title,
      subtitle: s.subtitle,
      icon: <Icon strokeWidth={1.9} aria-hidden />,
      color: isFvColor(s.color) ? s.color : 'blue',
    }
  })

  return (
    <div className="fv-site bg-white">
      <Navigation solutions={navSolutions} />
      <main className="min-h-screen">
        <MotionProvider>{children}</MotionProvider>
      </main>
      <Footer />
    </div>
  )
}
