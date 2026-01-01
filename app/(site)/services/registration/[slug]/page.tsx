'use client';

import { registrationServices } from '@/app/data/services/registration';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceFeatures from '@/app/components/services/ServiceFeatures';
import ProcessTimeline from '@/app/components/services/ProcessTimeline';
import ServiceForm from '@/app/components/services/ServiceForm';
import FAQAccordion from '@/app/components/services/FAQAccordion';
import RelatedServices from '@/app/components/services/RelatedServices';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import { FileText, CheckCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function RegistrationServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = registrationServices.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

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
        category="Business Registration"
        categorySlug="registration"
        onGetStarted={scrollToForm}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-6">
              About {service.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {service.longDescription}
            </p>
            <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6">
              <p className="text-gray-700">
                <strong className="text-primary">Expert Tip:</strong> Choosing the right business structure is crucial for your long-term success. We've helped over 100,000 businesses get registered with complete compliance and documentation support.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              What You Get
            </h2>
            <ServiceFeatures features={service.features} benefits={service.benefits} />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              Our Simple Process
            </h2>
            <ProcessTimeline steps={service.process} />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div id="inquiry-form" className="mb-16">
            <ServiceForm serviceId={service.id} serviceTitle={service.title} />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="mb-16">
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-primary" />
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

        <ScrollReveal direction="up">
          <RelatedServices
            services={registrationServices}
            currentServiceId={service.id}
            category="registration"
          />
        </ScrollReveal>
      </div>
    </div>
  );
}

