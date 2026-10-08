'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle, Clock, FileText, IndianRupee } from 'lucide-react';
import Breadcrumb from '../common/Breadcrumb';
import Button from '../fv/Button';
import IconTile from '../fv/IconTile';
import { LIGHT_HERO_BG } from '../fv/LightHero';
import { getIconFromName } from '@/app/lib/utils/apiDataConverter';
import { contactService } from '@/app/lib/api';
import { formatFromPrice, formatINR } from '@/app/lib/fv/text';

interface ServiceHeroProps {
  title: string;
  shortDescription: string;
  /** Lucide icon component – omit when rendering from Server Component; use iconName instead. */
  icon?: LucideIcon;
  /** Icon name (e.g. "FileText") for Server Component parents – resolved client-side. */
  iconName?: string;
  price?: {
    min: number;
    max: number;
    currency: string;
  } | null;
  duration?: string;
  category: string;
  categorySlug: string;
  onGetStarted?: () => void;
  /** When set, Get Started button scrolls to this element id (for Server Component parents that cannot pass onGetStarted). */
  scrollTargetId?: string;
}

const TRUST_POINTS = ['Expert Assistance', '100% Online Process', 'Money Back Guarantee'];
const CARD_POINTS = ['10,000+ Happy Customers', 'Verified CA/CS Professionals', 'Secure Payment Gateway'];

export default function ServiceHero({
  title,
  shortDescription,
  icon: IconProp,
  iconName,
  price,
  duration,
  category,
  categorySlug,
  onGetStarted,
  scrollTargetId,
}: ServiceHeroProps) {
  const Icon = (IconProp ?? (iconName ? getIconFromName(iconName) : FileText)) as LucideIcon;

  // Phone number is bound to the admin-managed Contact details, not hardcoded.
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    contactService
      .get()
      .then((info) => {
        if (active && info?.phone) setContactPhone(info.phone);
      })
      .catch(() => {
        /* leave unset; the call line is simply hidden if contact info is unavailable */
      });
    return () => {
      active = false;
    };
  }, []);
  const telHref = contactPhone ? `tel:${contactPhone.replace(/[^\d+]/g, '')}` : '';

  const handleGetStarted =
    onGetStarted ??
    (scrollTargetId ? () => document.getElementById(scrollTargetId!)?.scrollIntoView({ behavior: 'smooth' }) : undefined);

  // Same rule as the home cards: a positive min shows the price, ₹0 / missing → "Price on request".
  const hasPrice = formatFromPrice(price) !== null;
  // The visible ₹ is an aria-hidden icon, so screen readers get the full amount from sr-only text.
  const priceLabel = !price
    ? ''
    : price.min === price.max
      ? formatINR(price.min)
      : `${formatINR(price.min)} to ${formatINR(price.max)}`;

  return (
    <section className={`relative overflow-hidden border-b border-fv-line ${LIGHT_HERO_BG}`}>
      <div className="fv-wrap py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: category, href: `/services/${categorySlug}` },
            { label: title },
          ]}
        />
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <IconTile icon={Icon} size="lg" solid />
              <span className="rounded-full border border-[#CFE2F2] bg-white px-3 py-1 text-[13px] font-semibold text-fv-blue-d">{category}</span>
            </div>
            <h1 className="text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-fv-navy md:text-[44px]">{title}</h1>
            <p className="mt-4 max-w-[680px] text-base leading-relaxed text-fv-slate md:text-lg">{shortDescription}</p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2 text-[15px] font-medium text-fv-navy">
                  <CheckCircle className="h-5 w-5 text-fv-green" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <aside aria-label="Pricing" className="fv-card p-6 shadow-fv-raised">
            {hasPrice ? (
              <div className="mb-4">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-fv-slate">Starting at</p>
                <p className="mt-1 flex items-center gap-1 text-[32px] font-extrabold leading-none text-fv-navy">
                  <IndianRupee className="h-6 w-6 text-fv-slate" aria-hidden="true" />
                  <span className="sr-only">{priceLabel}</span>
                  <span aria-hidden="true">
                    {price!.min === price!.max
                      ? price!.min.toLocaleString('en-IN')
                      : `${price!.min.toLocaleString('en-IN')} - ${price!.max.toLocaleString('en-IN')}`}
                  </span>
                </p>
                <p className="mt-1.5 text-sm text-fv-slate">All-inclusive pricing</p>
              </div>
            ) : (
              <p className="mb-4 text-lg font-bold text-fv-navy">Price on request</p>
            )}
            {duration && (
              <div className="mb-5 flex items-center gap-2 border-b border-fv-line pb-5 text-[15px] text-fv-navy">
                <Clock className="h-4 w-4 text-fv-slate" aria-hidden="true" />
                {duration}
              </div>
            )}
            <Button type="button" size="lg" className="w-full" onClick={handleGetStarted}>
              Get Started Now
            </Button>
            {contactPhone && (
              <p className="mt-3 text-center text-xs text-fv-slate">
                or call us at{' '}
                <a href={telHref} className="font-semibold text-fv-blue-d hover:underline">
                  {contactPhone}
                </a>
              </p>
            )}
            <ul className="mt-5 space-y-2.5 border-t border-fv-line pt-5">
              {CARD_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-fv-slate">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-none text-fv-green" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
