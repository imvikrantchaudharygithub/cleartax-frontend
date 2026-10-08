'use client';

import { gstServices } from '@/app/data/services/gst';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';

export default function GSTRevocationPage() {
  const service = gstServices.find((s) => s.slug === 'revocation')!;

  const scrollToForm = () => {
    document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <ServiceHero
        title={service.title}
        shortDescription={service.shortDescription}
        icon={service.icon}
        price={service.price}
        duration={service.duration}
        category="GST"
        categorySlug="gst"
        onGetStarted={scrollToForm}
      />

      <ServiceDetailBody service={service} aboutTitle="About GST Revocation" related={gstServices} relatedCategory="gst" />
    </div>
  );
}


