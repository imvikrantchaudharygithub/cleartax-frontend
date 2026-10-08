'use client';

import { gstServices } from '@/app/data/services/gst';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';

export default function GSTRegistrationPage() {
  const service = gstServices.find((s) => s.slug === 'registration')!;

  const scrollToForm = () => {
    document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
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

      {/* Main Content */}
      <ServiceDetailBody
        service={service}
        aboutTitle="About GST Registration"
        related={gstServices}
        relatedCategory="gst"
        aboutExtra={
          <div className="rounded-r-xl border-l-4 border-fv-blue bg-fv-blue-50 p-5 text-[15px] leading-relaxed text-fv-navy">
            <strong>Did you know?</strong> GST registration not only makes your business legally compliant but also enables you to expand your operations across India without restrictions. With over 50,000+ businesses registered through our platform, we ensure a smooth and hassle-free registration process.
          </div>
        }
      />
    </div>
  );
}


