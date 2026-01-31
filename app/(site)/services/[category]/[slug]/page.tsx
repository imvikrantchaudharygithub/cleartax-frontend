'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serviceService } from '@/app/lib/api';
import { convertApiServiceToDisplay, getIconFromName } from '@/app/lib/utils/apiDataConverter';
import ServiceHero from '@/app/components/services/ServiceHero';
import ServiceFeatures from '@/app/components/services/ServiceFeatures';
import ProcessTimeline from '@/app/components/services/ProcessTimeline';
import ServiceForm from '@/app/components/services/ServiceForm';
import FAQAccordion from '@/app/components/services/FAQAccordion';
import RelatedServices from '@/app/components/services/RelatedServices';
import ServiceCard from '@/app/components/services/ServiceCard';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '@/app/components/animations/StaggerContainer';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { Search, CheckCircle, Users, Shield, Zap, Loader2, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Service } from '@/app/types/services';
import { API_CONFIG } from '@/app/lib/api/config';

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
            });
          } else {
            // Fallback
            setSubcategoryInfo({
              title: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
              description: `Comprehensive ${slug.replace(/-/g, ' ')} services`,
              heroTitle: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
              heroDescription: `Expert ${slug.replace(/-/g, ' ')} solutions`,
              iconName: 'FileText',
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pageType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Page not found'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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

  // Render Subcategory Listing Page (for complex categories)
  if (pageType === 'subcategory' && subcategoryInfo) {
    const SubcategoryIcon = getIconFromName(subcategoryInfo.iconName) || FileText;

    return (
      <div className="min-h-screen bg-gradient-to-b from-light-blue to-white">
        <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl mb-6">
                <SubcategoryIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary mb-4">
                {subcategoryInfo.heroTitle || subcategoryInfo.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                {subcategoryInfo.heroDescription || subcategoryInfo.description}
              </p>
              <div className="max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder={`Search ${subcategoryInfo.title} services...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefixIcon={<Search className="w-5 h-5" />}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: '50,000+ Registrations', icon: CheckCircle },
                { label: 'Expert CA Team', icon: Users },
                { label: '99.9% Success Rate', icon: Shield },
                { label: 'Quick Processing', icon: Zap },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 text-center shadow-sm"
                >
                  <stat.icon className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-primary mb-3">
              Our {subcategoryInfo.title} Services
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of services tailored to your business needs
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredServices.map((service) => (
              <StaggerItem key={service.id}>
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
              </StaggerItem>
            ))}
          </StaggerContainer>

          {filteredServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-600 text-lg mb-4">
                No services found matching your search.
              </p>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
