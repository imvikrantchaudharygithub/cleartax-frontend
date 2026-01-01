import Link from 'next/link';
import Button from './components/ui/Button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-error/10 rounded-full mb-8">
          <FileQuestion className="w-12 h-12 text-error" />
        </div>
        
        <h1 className="font-heading font-bold text-6xl text-primary mb-4">404</h1>
        <h2 className="font-heading font-bold text-3xl text-primary mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="tertiary" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              View All Blog Posts
            </Button>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-card">
          <h3 className="font-semibold text-primary mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Link href="/calculators" className="text-accent hover:underline">Calculators</Link>
            <Link href="/compliance" className="text-accent hover:underline">Compliance</Link>
            <Link href="/blog" className="text-accent hover:underline">Blog</Link>
            <Link href="/contact" className="text-accent hover:underline">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

