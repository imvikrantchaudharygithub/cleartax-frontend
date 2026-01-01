'use client';

import { gstServices } from '@/app/data/services/gst';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceFeatures from '@/app/components/services/ServiceFeatures';
import ProcessTimeline from '@/app/components/services/ProcessTimeline';
import ServiceForm from '@/app/components/services/ServiceForm';
import FAQAccordion from '@/app/components/services/FAQAccordion';
import RelatedServices from '@/app/components/services/RelatedServices';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import { FileText, CheckCircle } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Long Description */}
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-6">
              About GST Registration
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {service.longDescription}
            </p>
            <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-6">
              <p className="text-gray-700">
                <strong className="text-primary">Did you know?</strong> GST registration not only makes your business legally compliant but also enables you to expand your operations across India without restrictions. With over 50,000+ businesses registered through our platform, we ensure a smooth and hassle-free registration process.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Features and Benefits */}
        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              What You Get
            </h2>
            <ServiceFeatures features={service.features} benefits={service.benefits} />
          </div>
        </ScrollReveal>

        {/* Process Timeline */}
        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              Our Simple Process
            </h2>
            <ProcessTimeline steps={service.process} />
          </div>
        </ScrollReveal>

        {/* Inquiry Form */}
        <ScrollReveal direction="up">
          <div id="inquiry-form" className="mb-16">
            <ServiceForm serviceId={service.id} serviceTitle={service.title} />
          </div>
        </ScrollReveal>

        {/* Requirements */}
        <ScrollReveal direction="up">
          <div className="mb-16">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-accent" />
                <h2 className="font-heading font-bold text-2xl text-primary">
                  Documents Required
                </h2>
              </div>
              <ul className="grid md:grid-cols-2 gap-4">
                {service.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* FAQs */}
        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto">
              <FAQAccordion faqs={service.faqs} />
            </div>
          </div>
        </ScrollReveal>

        {/* Related Services */}
        <ScrollReveal direction="up">
          <RelatedServices
            services={gstServices}
            currentServiceId={service.id}
            category="gst"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}


