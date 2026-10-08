import IntentLink from './components/fv/IntentLink';
import { FileQuestion } from 'lucide-react';
import LightHero from './components/fv/LightHero';
import SearchBar from './components/fv/SearchBar';
import { ButtonLink } from './components/fv/Button';

const TOP_CATEGORIES = [
  { label: 'GST Services', href: '/services/gst' },
  { label: 'Business Registration', href: '/services/registration' },
  { label: 'Income Tax', href: '/services/income-tax' },
  { label: 'Trademarks & IP', href: '/services/trademarks' },
];

export default function NotFound() {
  return (
    <div className="fv-site min-h-screen bg-white">
      <LightHero
        icon={FileQuestion}
        title="Page not found"
        subtitle="Sorry, the page you're looking for doesn't exist or has been moved. Try searching for a service instead."
      >
        <SearchBar id="not-found-search" className="mx-auto max-w-[560px]" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            Go to Homepage
          </ButtonLink>
          <ButtonLink href="/services" variant="outline" size="lg">
            Browse all services
          </ButtonLink>
        </div>
      </LightHero>
      <div className="fv-wrap py-12">
        <h2 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-fv-slate">Popular categories</h2>
        <ul className="flex flex-wrap justify-center gap-2">
          {TOP_CATEGORIES.map((category) => (
            <li key={category.href}>
              <IntentLink
                href={category.href}
                className="inline-flex rounded-full border border-fv-line bg-white px-4 py-2 text-sm font-semibold text-fv-navy hover:border-fv-blue hover:text-fv-blue-d"
              >
                {category.label}
              </IntentLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
