'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, Calculator, Menu, X, ChevronDown, ChevronRight, BookOpen, MessageSquare, Database, UserCircle, Star, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

const serviceCategories = [
  { label: 'GST Services', href: '/admin/services/gst', slug: 'gst' },
  { label: 'Income Tax', href: '/admin/services/income-tax', slug: 'income-tax' },
  { label: 'Registration', href: '/admin/services/registration', slug: 'registration' },
  { label: 'Trademarks', href: '/admin/services/trademarks', slug: 'trademarks' },
  { label: 'IPO Services', href: '/admin/services/ipo', slug: 'ipo' },
  { label: 'Legal Services', href: '/admin/services/legal', slug: 'legal' },
  { label: 'Banking & Finance', href: '/admin/services/banking-finance', slug: 'banking-finance' },
];

const navItems = [
  { label: 'Dashboard', href: '/admin/home', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Team', href: '/admin/team', icon: UserCircle },
  { label: 'Testimonials', href: '/admin/testimonials', icon: Star },
  { label: 'Blog', href: '/admin/blog', icon: BookOpen },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Contact Info', href: '/admin/contact', icon: Phone },
  { label: 'Calculators', href: '/admin/calculators', icon: Calculator },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isServicesActive = pathname?.startsWith('/admin/services');
  const [isServicesOpen, setIsServicesOpen] = useState(isServicesActive);
  
  // Auto-expand services dropdown when on services page
  useEffect(() => {
    if (isServicesActive) {
      setIsServicesOpen(true);
    }
  }, [isServicesActive]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-40 transition-transform duration-300',
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">ClearTax Admin</h1>
            <p className="text-sm text-gray-400 mt-1">Management Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Services Dropdown */}
            <div>
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                  isServicesActive
                    ? 'bg-primary text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-medium">Services</span>
                </div>
                {isServicesOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div className="mt-2 ml-4 space-y-1 border-l border-gray-700 pl-4">
                  {serviceCategories.map((category) => {
                    const isCategoryActive = pathname === category.href;
                    return (
                      <Link
                        key={category.href}
                        href={category.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={clsx(
                          'block px-4 py-2 rounded-lg transition-colors text-sm',
                          isCategoryActive
                            ? 'bg-primary/20 text-primary border-l-2 border-primary'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        )}
                      >
                        {category.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Migration Link */}
            <Link
              href="/admin/migrate"
              onClick={() => setIsMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mt-4',
                pathname === '/admin/migrate'
                  ? 'bg-accent text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Migrate Data</span>
            </Link>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              <p className="font-medium text-gray-300 mb-1">Admin User</p>
              <p className="text-xs">admin@cleartax.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

