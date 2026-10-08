'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serviceService } from '@/app/lib/api';
import { convertApiServiceToDisplay, getIconFromName } from '@/app/lib/utils/apiDataConverter';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceDetailBody from '@/app/components/services/ServiceDetailBody';
import ServiceCard from '@/app/components/services/ServiceCard';
import Button from '@/app/components/fv/Button';
import type { LucideIcon } from 'lucide-react';
import { Users, Shield, Zap, Loader2, FileText, ArrowRight, TriangleAlert } from 'lucide-react';
import CategoryHero from '@/app/components/services/CategoryHero';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
import IconTile from '@/app/components/fv/IconTile';
import { Service } from '@/app/types/services';
import { API_CONFIG } from '@/app/lib/api/config';
import { formatCategoryTitle } from '@/app/lib/utils/formatCategoryTitle';

const DEFAULT_HERO_STATS = [
  { label: '50,000+ Registrations', iconName: 'CircleCheckBig' },
  { label: 'Expert CA Team', iconName: 'Users' },
  { label: '99.9% Success Rate', iconName: 'Shield' },
  { label: 'Quick Processing', iconName: 'Zap' },
];

export default function CategorySlugPage({ 
  params 
}: { 
  params: Promise<{ category: string; slug: string }> 
}) {
  const { category, slug } = use(params);
  const [pageType, setPageType] = useState<'service' | 'subcategory' | null>(null);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [subcategoryInfo, setSubcategoryInfo] = useState<any>(null);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }
    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.title?.toLowerCase().includes(query) ||
        service.shortDescription?.toLowerCase().includes(query)
    );
  }, [services, searchQuery]);

  const subcategoryHeroStats = useMemo(() => {
    const apiStats = subcategoryInfo?.heroStats;
    if (!Array.isArray(apiStats) || apiStats.length === 0) {
      return DEFAULT_HERO_STATS;
    }

    const normalizedStats = apiStats.slice(0, 4).map((item: any, index: number) => ({
      label: item?.label || DEFAULT_HERO_STATS[index]?.label || '',
      iconName: item?.iconName || DEFAULT_HERO_STATS[index]?.iconName || 'CircleCheckBig',
    }));

    while (normalizedStats.length < 4) {
      normalizedStats.push(DEFAULT_HERO_STATS[normalizedStats.length]);
    }

    return normalizedStats;
  }, [subcategoryInfo?.heroStats]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, check if the category has subcategories by calling /api/services/:category
        const categoryUrl = `${API_CONFIG.BASE_URL}/services/${category}`;
        const categoryResponse = await fetch(categoryUrl, {
          next: { revalidate: 60 },
        });

        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
        }

        const categoryData = await categoryResponse.json();

        if (!categoryData.success) {
          throw new Error(categoryData.message || 'Failed to fetch category');
        }

        const hasSubcategories = categoryData.category?.hasSubcategories === true;

        if (hasSubcategories) {
          // Category has subcategories, so /services/{category}/{slug} is a subcategory listing
          // Call /api/services/:category/:slug to get services in the subcategory
          setPageType('subcategory');
          setCategoryInfo(categoryData.category);
          
          const subcategoryServicesUrl = `${API_CONFIG.BASE_URL}/services/${category}/${slug}`;
          const subcategoryServicesResponse = await fetch(subcategoryServicesUrl, {
            next: { revalidate: 60 },
          });

          if (!subcategoryServicesResponse.ok) {
            throw new Error(`Failed to fetch services: ${subcategoryServicesResponse.status}`);
          }

          const subcategoryServicesData = await subcategoryServicesResponse.json();

          if (!subcategoryServicesData.success) {
            throw new Error(subcategoryServicesData.message || 'Failed to fetch subcategory services');
          }

          let fetchedServices: any[] = [];
          
          if (Array.isArray(subcategoryServicesData.data)) {
            fetchedServices = subcategoryServicesData.data;
          }

          const displayServices = fetchedServices.map(service => convertApiServiceToDisplay(service));
          setServices(displayServices);

          // Extract subcategory info from response
          if (subcategoryServicesData.subcategory) {
            const sub = subcategoryServicesData.subcategory;
            setSubcategoryInfo({
              title: sub.title || slug,
              description: sub.description || sub.shortDescription || `Comprehensive ${slug.replace(/-/g, ' ')} services`,
              heroTitle: sub.heroTitle || sub.title || slug,
              heroDescription: sub.heroDescription || sub.description || sub.shortDescription || `Expert ${slug.replace(/-/g, ' ')} solutions`,
              iconName: sub.iconName || 'FileText',
              heroStats: sub.heroStats,
            });
          } else if (fetchedServices.length > 0 && fetchedServices[0].subcategoryInfo) {
            // Fallback: get from first service
            const firstService = fetchedServices[0];
            setSubcategoryInfo({
              title: firstService.subcategoryInfo.title || slug,
              description: firstService.subcategoryInfo.description || `Comprehensive ${slug.replace(/-/g, ' ')} services`,
              heroTitle: firstService.subcategoryInfo.title || slug,
              heroDescription: firstService.subcategoryInfo.description || `Expert ${slug.replace(/-/g, ' ')} solutions`,
              iconName: firstService.subcategoryInfo.iconName || 'FileText',
              heroStats: firstService.subcategoryInfo.heroStats,
            });
          } else {
            // Fallback
            setSubcategoryInfo({
              title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
              description: `Comprehensive ${slug.replace(/-/g, ' ')} services`,
              heroTitle: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
              heroDescription: `Expert ${slug.replace(/-/g, ' ')} solutions`,
              iconName: 'FileText',
              heroStats: DEFAULT_HERO_STATS,
            });
          }

          // Set category title
          if (categoryData.category) {
            setCategoryTitle(categoryData.category.title || category);
          } else {
            setCategoryTitle(category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '));
          }
        } else {
          // Category has no subcategories, so /services/{category}/{slug} is a service detail page
          // Call /api/services/:category/:slug
          setPageType('service');
          const categorySlugUrl = `${API_CONFIG.BASE_URL}/services/${category}/${slug}`;
          const categorySlugResponse = await fetch(categorySlugUrl, {
            next: { revalidate: 60 },
          });

          if (!categorySlugResponse.ok) {
            throw new Error(`Failed to fetch service: ${categorySlugResponse.status}`);
          }

          const responseData = await categorySlugResponse.json();

          if (!responseData.success) {
            throw new Error(responseData.message || 'Failed to fetch service');
          }

          if (responseData.data) {
            // This is a service detail page
            const service = responseData.data;
            const displayService = convertApiServiceToDisplay(service);
            setServiceData(displayService);

            // Get category title
            if (responseData.category) {
              setCategoryTitle(responseData.category.title || category);
            } else if (service.categoryInfo) {
              setCategoryTitle(service.categoryInfo.title || category);
            } else {
              setCategoryTitle(category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '));
            }

            // Get related services
            const allServicesUrl = `${API_CONFIG.BASE_URL}/services/${category}`;
            const allServicesResponse = await fetch(allServicesUrl, {
              next: { revalidate: 60 },
            });
            if (allServicesResponse.ok) {
              const allServicesData = await allServicesResponse.json();
              let allServices: any[] = [];
              if (allServicesData.success && Array.isArray(allServicesData.data)) {
                allServices = allServicesData.data;
              } else if (Array.isArray(allServicesData)) {
                allServices = allServicesData;
              }
              const related = allServices
                .filter((s: any) => (s._id || s.id) !== (service._id || service.id))
                .map(convertApiServiceToDisplay)
                .slice(0, 3);
              setRelatedServices(related);
            }
          } else {
            throw new Error('Service not found');
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    if (category && slug) {
      fetchData();
    }
  }, [category, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" />
      </div>
    );
  }

  if (error || !pageType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <IconTile icon={TriangleAlert} color="red" size="lg" className="mx-auto mb-4" />
          <p className="mb-5 text-base font-semibold text-fv-navy">{error || 'Page not found'}</p>
          <Button type="button" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Render Service Detail Page (for simple categories)
  if (pageType === 'service' && serviceData) {
    const scrollToForm = () => {
      document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
    };

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
          category={formatCategoryTitle(categoryTitle)}
          categorySlug={category}
          onGetStarted={scrollToForm}
        />

        <ServiceDetailBody service={serviceData} related={relatedServices} relatedCategory={category} />
      </div>
    );
  }

  // Render Subcategory Listing Page (for complex categories)
  if (pageType === 'subcategory' && subcategoryInfo) {
    const SubcategoryIcon = getIconFromName(subcategoryInfo.iconName) || FileText;

    return (
      <div className="bg-white">
        <CategoryHero
          title={subcategoryInfo.heroTitle || subcategoryInfo.title}
          description={subcategoryInfo.heroDescription || subcategoryInfo.description}
          icon={SubcategoryIcon as LucideIcon}
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Services', href: '/services' },
            { label: formatCategoryTitle(categoryInfo?.title || category.replace(/-/g, ' ')), href: `/services/${category}` },
            { label: subcategoryInfo.title },
          ]}
          searchLabel={`Search ${subcategoryInfo.title} services...`}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          stats={subcategoryHeroStats}
        />
        <Section>
          <SectionHead
            title={`Our ${subcategoryInfo.title} Services`}
            subtitle="Choose from our comprehensive range of services tailored to your business needs"
          />
          {filteredServices.length > 0 ? (
            <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <li key={service.id}>
                  <ServiceCard
                    title={service.title}
                    shortDescription={service.shortDescription}
                    icon={service.icon}
                    price={service.price}
                    duration={service.duration}
                    slug={service.slug}
                    category={category}
                    subcategory={slug}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center">
              <p className="mb-4 text-lg text-fv-slate">No services found matching your search.</p>
              <Button type="button" variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          )}
        </Section>
      </div>
    );
  }

  return null;
}
