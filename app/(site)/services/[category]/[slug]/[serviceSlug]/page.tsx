'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { serviceService } from '@/app/lib/api';
import { convertApiServiceToDisplay } from '@/app/lib/utils/apiDataConverter';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';
import Button from '@/app/components/fv/Button';
import IconTile from '@/app/components/fv/IconTile';
import { Loader2, TriangleAlert } from 'lucide-react';
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
        const serviceResponse = await fetch(serviceUrl, {
          next: { revalidate: 60 },
        });

        const serviceDataResponse = await serviceResponse.json();

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
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" />
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <IconTile icon={TriangleAlert} color="red" size="lg" className="mx-auto mb-4" />
          <p className="mb-5 text-base font-semibold text-fv-navy">{error || 'Service not found'}</p>
          <Button type="button" onClick={() => window.location.reload()}>
            Retry
          </Button>
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

      <ServiceDetailBody
        service={serviceData}
        related={relatedServices}
        relatedCategory={category}
        relatedSubcategory={slug}
      />
    </div>
  );
}

