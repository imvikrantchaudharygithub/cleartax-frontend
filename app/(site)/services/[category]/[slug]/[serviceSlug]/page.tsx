'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { serviceService } from '@/app/lib/api';
import { convertApiServiceToDisplay } from '@/app/lib/utils/apiDataConverter';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceFeatures from '@/app/components/services/ServiceFeatures';
import ProcessTimeline from '@/app/components/services/ProcessTimeline';
import ServiceForm from '@/app/components/services/ServiceForm';
import FAQAccordion from '@/app/components/services/FAQAccordion';
import RelatedServices from '@/app/components/services/RelatedServices';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Service } from '@/app/types/services';
import { API_CONFIG } from '@/app/lib/api/config';

export default function SubcategoryServiceDetailPage({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string; serviceSlug: string }> 
}) {
  const { category, slug, serviceSlug } = use(params);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [subcategoryTitle, setSubcategoryTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch service using /api/services/:category/:subcategory/:slug
        // The slug parameter should be the subcategory slug as returned by the API
        const serviceUrl = `${API_CONFIG.BASE_URL}/services/${category}/${slug}/${serviceSlug}`;
        console.log('Fetching service from:', serviceUrl);
        
        const serviceResponse = await fetch(serviceUrl, {
          next: { revalidate: 60 },
        });

        const serviceDataResponse = await serviceResponse.json();
        console.log('Service API response:', serviceDataResponse);

        if (!serviceResponse.ok || !serviceDataResponse.success) {
          const errorMessage = serviceDataResponse.message || `Failed to fetch service: ${serviceResponse.status}`;
          console.error('Service fetch error:', errorMessage, serviceDataResponse);
          throw new Error(errorMessage);
        }

        if (!serviceDataResponse.data) {
          throw new Error('Service data not found in response');
        }

        const service = serviceDataResponse.data;
        const displayService = convertApiServiceToDisplay(service);
        setServiceData(displayService);

        // Get category and subcategory titles from API response
        if (serviceDataResponse.subcategory) {
          setSubcategoryTitle(serviceDataResponse.subcategory.title || slug);
        } else if (service.subcategoryInfo) {
          setSubcategoryTitle(service.subcategoryInfo.title || slug);
        } else if (service.categoryInfo) {
          setSubcategoryTitle(service.categoryInfo.title || slug);
        } else {
          setSubcategoryTitle(slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '));
        }

        // Main category title
        if (serviceDataResponse.category) {
          setCategoryTitle(serviceDataResponse.category.title || category);
        } else if (service.categoryInfo) {
          const categoryType = service.categoryInfo.categoryType;
          if (categoryType) {
            setCategoryTitle(
              categoryType === 'ipo' ? 'IPO Services' :
              categoryType === 'legal' ? 'Legal Services' :
              categoryType === 'banking-finance' ? 'Banking & Finance' :
              category
            );
          } else {
            setCategoryTitle(service.categoryInfo.title || category);
          }
        } else {
          setCategoryTitle(category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '));
        }

          // Get related services from same subcategory using /api/services/:category/:subcategory
          const subcategoryServicesUrl = `${API_CONFIG.BASE_URL}/services/${category}/${slug}`;
          const subcategoryServicesResponse = await fetch(subcategoryServicesUrl, {
            next: { revalidate: 60 },
          });

          if (subcategoryServicesResponse.ok) {
            const subcategoryServicesData = await subcategoryServicesResponse.json();
            let subcategoryServices: any[] = [];

            if (subcategoryServicesData.success && Array.isArray(subcategoryServicesData.data)) {
              subcategoryServices = subcategoryServicesData.data;
            } else if (Array.isArray(subcategoryServicesData)) {
              subcategoryServices = subcategoryServicesData;
            }

            const related = subcategoryServices
              .filter((s: any) => (s._id || s.id) !== (service._id || service.id))
              .map(convertApiServiceToDisplay)
              .slice(0, 3);
            setRelatedServices(related);
          }
      } catch (err: any) {
        console.error('Error fetching service:', err);
        setError(err.message || 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    if (category && slug && serviceSlug) {
      fetchData();
    }
  }, [category, slug, serviceSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Service not found'}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const scrollToForm = () => {
    document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert Service to format for ServiceHero
  const serviceForHero = {
    title: serviceData.title,
    shortDescription: serviceData.shortDescription,
    icon: serviceData.icon,
    price: serviceData.price,
    duration: serviceData.duration,
  };

  return (
    <div className="min-h-screen bg-white">
      <ServiceHero
        title={serviceForHero.title}
        shortDescription={serviceForHero.shortDescription}
        icon={serviceForHero.icon}
        price={serviceForHero.price}
        duration={serviceForHero.duration}
        category={categoryTitle}
        categorySlug={category}
        onGetStarted={scrollToForm}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-6">
              About {serviceData.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {serviceData.longDescription}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              What You Get
            </h2>
            <ServiceFeatures features={serviceData.features} benefits={serviceData.benefits} />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="mb-16">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              Our Simple Process
            </h2>
            <ProcessTimeline steps={serviceData.process} />
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div id="inquiry-form" className="mb-16">
            <ServiceForm serviceId={serviceData.id} serviceTitle={serviceData.title} />
          </div>
        </ScrollReveal>

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
                {serviceData.requirements.map((req, index) => (
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
              <FAQAccordion faqs={serviceData.faqs} />
            </div>
          </div>
        </ScrollReveal>

        {relatedServices.length > 0 && (
          <ScrollReveal direction="up">
            <RelatedServices
              services={relatedServices}
              currentServiceId={serviceData.id}
              category={category}
            />
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

