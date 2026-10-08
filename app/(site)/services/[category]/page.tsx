'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { serviceService, contactService } from '@/app/lib/api';
import { ContactInfo } from '@/app/lib/api/types';
import { convertApiServiceToDisplay, getIconFromName } from '@/app/lib/utils/apiDataConverter';
import ServiceCard from '@/app/components/services/ServiceCard';
import Button, { fvButtonClass } from '@/app/components/fv/Button';
import type { LucideIcon } from 'lucide-react';
import { Loader2, FileText, Phone, TriangleAlert } from 'lucide-react';
import CategoryHero from '@/app/components/services/CategoryHero';
import Section from '@/app/components/fv/Section';
import SectionHead from '@/app/components/fv/SectionHead';
import Tile from '@/app/components/fv/Tile';
import IconTile from '@/app/components/fv/IconTile';
import IconTileByName from '@/app/components/fv/IconTileByName';
import { colorAt } from '@/app/lib/fv/colors';
import { plural } from '@/app/lib/fv/text';
import { API_CONFIG } from '@/app/lib/api/config';
import { formatCategoryTitle } from '@/app/lib/utils/formatCategoryTitle';
// Shared with the admin category-details editor so placeholders match the live page.
import {
  DEFAULT_WHY_CHOOSE_SECTION,
  DEFAULT_HERO_STATS,
  type WhyChooseItem,
  type WhyChooseSection,
  type HeroStatItem,
} from '@/app/lib/constants/categoryDefaults';

interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: any;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  features: string[];
  benefits: string[];
  requirements: string[];
  process: Array<{
    step: number;
    title: string;
    description: string;
    duration: string;
  }>;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  relatedServices: string[];
}

interface SubCategory {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  serviceCount: number;
}

export default function CategoryServicesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params?.category as string;
  const categoryType = searchParams?.get('type') as string | null;

  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [hasSubcategories, setHasSubcategories] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  // Contact details (phone / WhatsApp) for the CTA, bound from admin Contact info.
  useEffect(() => {
    contactService
      .get()
      .then(setContactInfo)
      .catch(() => setContactInfo(null));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch category data using /api/services/:category
        // This returns category info with hasSubcategories flag
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

        // Extract category info
        if (categoryData.category) {
          const mainCategoryInfo = categoryData.category;
          
          // Check if the API returned a subcategory instead of the main category
          // This happens when the backend treats categoryType categories differently
          const isSubcategoryResponse = mainCategoryInfo.categoryType === category && 
                                        mainCategoryInfo.hasSubcategories === false &&
                                        !categoryData.subcategories &&
                                        categoryData.data?.length === 0;
          
          if (isSubcategoryResponse) {
            // The API returned a subcategory object instead of the main category
            // This means we need to fetch all services for this categoryType and group them by subcategory
            console.warn('API returned subcategory instead of main category. Fetching all services to group by subcategory.');
            
            // Fetch all services for this category type
            const allServicesUrl = `${API_CONFIG.BASE_URL}/services?category=${category}`;
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
              
              // Group services by subcategory (using categoryInfo.slug as subcategory identifier)
              const subCategoryMap = new Map<string, {
                id: string;
                slug: string;
                title: string;
                description: string;
                iconName: string;
                heroTitle: string;
                heroDescription: string;
                services: any[];
              }>();
              
              allServices.forEach((service: any) => {
                if (service.categoryInfo && service.categoryInfo.categoryType === category) {
                  const subCatSlug = service.categoryInfo.slug;
                  if (!subCategoryMap.has(subCatSlug)) {
                    subCategoryMap.set(subCatSlug, {
                      id: service.categoryInfo._id || service.categoryInfo.id || subCatSlug,
                      slug: subCatSlug,
                      title: service.categoryInfo.title || subCatSlug,
                      description: service.categoryInfo.description || '',
                      iconName: service.categoryInfo.iconName || 'FileText',
                      heroTitle: service.categoryInfo.heroTitle || service.categoryInfo.title || subCatSlug,
                      heroDescription: service.categoryInfo.heroDescription || service.categoryInfo.description || '',
                      services: [],
                    });
                  }
                  subCategoryMap.get(subCatSlug)!.services.push(service);
                }
              });
              
              // Convert map to array with service counts
              const subCategoriesList = Array.from(subCategoryMap.values()).map(subCat => ({
                id: subCat.id,
                slug: subCat.slug,
                title: subCat.title,
                description: subCat.description,
                iconName: subCat.iconName,
                heroTitle: subCat.heroTitle,
                heroDescription: subCat.heroDescription,
                serviceCount: subCat.services.length,
              }));
              
              setSubCategories(subCategoriesList);
              setHasSubcategories(true);
              
              // Set main category info from the first subcategory or use defaults
              setCategoryInfo({
                title: mainCategoryInfo.title || `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Services`,
                description: `Comprehensive ${category.replace(/-/g, ' ')} solutions`,
                heroTitle: `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Services`,
                heroDescription: `Expert ${category.replace(/-/g, ' ')} solutions`,
                iconName: mainCategoryInfo.iconName || 'FileText',
                whyChooseSection: mainCategoryInfo.whyChooseSection,
                heroStats: mainCategoryInfo.heroStats,
              });
            } else {
              throw new Error('Failed to fetch services for category grouping');
            }
          } else {
            // Normal response - main category with subcategories or direct services
            setHasSubcategories(mainCategoryInfo.hasSubcategories === true);
            
            setCategoryInfo({
              title: mainCategoryInfo.title || category,
              description: mainCategoryInfo.description || `Comprehensive ${category.replace(/-/g, ' ')} solutions`,
              heroTitle: mainCategoryInfo.heroTitle || mainCategoryInfo.title || category,
              heroDescription: mainCategoryInfo.heroDescription || mainCategoryInfo.description || `Expert ${category.replace(/-/g, ' ')} solutions`,
              iconName: mainCategoryInfo.iconName || 'FileText',
              whyChooseSection: mainCategoryInfo.whyChooseSection,
              heroStats: mainCategoryInfo.heroStats,
            });

            // Check if category has subcategories
            if (mainCategoryInfo.hasSubcategories && categoryData.subcategories) {
              // Category has subcategories - display subcategory cards
              // First, check if itemsCount is missing or 0 - if so, fetch actual counts
              const subCategoriesList = categoryData.subcategories.map((subCat: any) => ({
                id: subCat._id || subCat.id,
                slug: subCat.slug,
                title: subCat.title,
                description: subCat.shortDescription || subCat.description || '',
                iconName: subCat.iconName || 'FileText',
                heroTitle: subCat.title,
                heroDescription: subCat.shortDescription || subCat.description || '',
                serviceCount: subCat.itemsCount || 0,
              }));

              // If any subcategory has 0 or missing service count, fetch actual counts
              const needsCountUpdate = subCategoriesList.some((subCat: SubCategory) => subCat.serviceCount === 0);

              if (needsCountUpdate) {
                const updatedSubCategoriesList = await Promise.all(
                  subCategoriesList.map(async (subCat: SubCategory) => {
                    if (subCat.serviceCount !== 0) {
                      return subCat;
                    }
                    try {
                      const subcategoryUrl = `${API_CONFIG.BASE_URL}/services/${category}/${subCat.slug}`;
                      const response = await fetch(subcategoryUrl, {
                        next: { revalidate: 60 },
                      });
                      if (!response.ok) return subCat;
                      const data = await response.json();
                      const fallbackCount = typeof data?.subcategory?.itemsCount === 'number'
                        ? data.subcategory.itemsCount
                        : Array.isArray(data?.data)
                          ? data.data.length
                          : subCat.serviceCount;

                      return {
                        ...subCat,
                        serviceCount: fallbackCount,
                      };
                    } catch {
                      return subCat;
                    }
                  })
                );

                setSubCategories(updatedSubCategoriesList);
              } else {
              setSubCategories(subCategoriesList);
              }
            } else if (!mainCategoryInfo.hasSubcategories && categoryData.data && categoryData.data.length > 0) {
              // Category has direct services - display services
              const fetchedServices = categoryData.data;
              const displayServices = fetchedServices.map((service: any) => convertApiServiceToDisplay(service));
              setServices(displayServices);
            }
          }
        } else {
          // Legacy fallback: category metadata may be missing while data array is present.
          // In that case, render as a direct-services category using safe defaults.
          setHasSubcategories(false);
          setCategoryInfo({
            title: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
            description: `Comprehensive ${category.replace(/-/g, ' ')} solutions`,
            heroTitle: `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Services`,
            heroDescription: `Expert ${category.replace(/-/g, ' ')} solutions`,
            iconName: 'FileText',
          });

          const fallbackServices = Array.isArray(categoryData.data)
            ? categoryData.data
            : [];
          setServices(fallbackServices.map((service: any) => convertApiServiceToDisplay(service)));
        }
      } catch (err: any) {
        console.error('Error fetching category data:', err);
        setError(err.message || 'Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchData();
    }
  }, [category, categoryType]);

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

  const filteredSubCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return subCategories;
    }
    const query = searchQuery.toLowerCase();
    return subCategories.filter(
      (subCat) =>
        subCat.title?.toLowerCase().includes(query) ||
        subCat.description?.toLowerCase().includes(query)
    );
  }, [subCategories, searchQuery]);

  const whyChooseSection = useMemo<WhyChooseSection>(() => {
    const apiSection = categoryInfo?.whyChooseSection;
    if (!apiSection?.items || !Array.isArray(apiSection.items) || apiSection.items.length === 0) {
      return DEFAULT_WHY_CHOOSE_SECTION;
    }

    const normalizedItems: WhyChooseItem[] = apiSection.items.slice(0, 3).map((item: any, index: number) => ({
      title: item?.title || DEFAULT_WHY_CHOOSE_SECTION.items[index]?.title || '',
      description: item?.description || DEFAULT_WHY_CHOOSE_SECTION.items[index]?.description || '',
      iconName: item?.iconName || DEFAULT_WHY_CHOOSE_SECTION.items[index]?.iconName || 'FileText',
    }));

    while (normalizedItems.length < 3) {
      normalizedItems.push(DEFAULT_WHY_CHOOSE_SECTION.items[normalizedItems.length]);
    }

    return {
      heading: apiSection.heading || DEFAULT_WHY_CHOOSE_SECTION.heading,
      items: normalizedItems,
    };
  }, [categoryInfo?.whyChooseSection]);

  const heroStats = useMemo<HeroStatItem[]>(() => {
    const apiStats = categoryInfo?.heroStats;
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
  }, [categoryInfo?.heroStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fv-blue" />
      </div>
    );
  }

  if (error || (!hasSubcategories && services.length === 0) || (hasSubcategories && subCategories.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <IconTile icon={TriangleAlert} color="red" size="lg" className="mx-auto mb-4" />
          <p className="mb-5 text-base font-semibold text-fv-navy">{error || 'No data found'}</p>
          <Button type="button" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryInfo ? getIconFromName(categoryInfo.iconName) || FileText : FileText;

  const listTitle = formatCategoryTitle(categoryInfo?.title || category.replace(/-/g, ' '));
  // Subcategories with 0 published services lead to an empty listing, so they are not shown (same rule as the home trio).
  const visibleSubCategories = filteredSubCategories.filter((subCategory) => (subCategory.serviceCount ?? 0) > 0);

  return (
    <div className="bg-white">
      <CategoryHero
        title={formatCategoryTitle(categoryInfo?.heroTitle || categoryInfo?.title || `${category.replace(/-/g, ' ')} Services`)}
        description={
          categoryInfo?.heroDescription ||
          categoryInfo?.description ||
          `Comprehensive ${category.replace(/-/g, ' ')} solutions for your business`
        }
        icon={CategoryIcon as LucideIcon}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: listTitle }]}
        searchLabel={`Search ${hasSubcategories ? 'categories' : 'services'}...`}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        stats={heroStats}
      />

      <Section>
        {hasSubcategories ? (
          <>
            <SectionHead title={`Our ${listTitle} Categories`} subtitle="Explore our specialized service categories" />
            {visibleSubCategories.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {visibleSubCategories.map((subCategory, i) => (
                  <li key={subCategory.id}>
                    <Tile
                      title={subCategory.title}
                      text={subCategory.description}
                      href={`/services/${category}/${subCategory.slug}`}
                      iconName={subCategory.iconName}
                      color={colorAt(i)}
                      meta={plural(subCategory.serviceCount ?? 0, 'service')}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <NoResults label="No categories found matching your search." onClear={() => setSearchQuery('')} />
            )}
          </>
        ) : (
          <>
            <SectionHead
              title={`Our ${listTitle} Services`}
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
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <NoResults label="No services found matching your search." onClear={() => setSearchQuery('')} />
            )}
          </>
        )}
      </Section>

      <Section soft>
        <SectionHead align="center" title={whyChooseSection.heading} />
        <ul className="grid gap-5 md:grid-cols-3">
          {whyChooseSection.items.map((feature: WhyChooseItem, index: number) => (
            <li key={`${feature.title}-${index}`} className="fv-card p-6 text-center">
              <IconTileByName name={feature.iconName} color={colorAt(index)} size="lg" className="mx-auto" />
              <h3 className="mt-4 text-lg font-bold text-fv-navy">{feature.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fv-slate">{feature.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tight>
        <div className="overflow-hidden rounded-[20px] bg-[radial-gradient(420px_260px_at_100%_100%,rgba(37,135,196,.45),transparent_70%),linear-gradient(120deg,#1E2C59,#175176)] px-6 py-10 text-center text-white md:px-12 md:py-12">
          <h2 className="text-2xl font-extrabold tracking-[-0.02em] md:text-[32px]">Need Help Choosing the Right Service?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/80 md:text-lg">
            Our experts are here to help you understand which service best fits your business needs. Get a free consultation today!
          </p>
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {contactInfo?.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with us on WhatsApp to schedule a free consultation"
                className={fvButtonClass('primary', 'lg', '!bg-[#25D366] !text-fv-navy !shadow-none hover:!bg-[#1FC15B]')}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Schedule Free Consultation
              </a>
            )}
            {contactInfo?.phone && (
              <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} aria-label={`Call us at ${contactInfo.phone}`} className={fvButtonClass('white', 'lg')}>
                <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                Call {contactInfo.phone}
              </a>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}

function NoResults({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="py-12 text-center">
      <p className="mb-4 text-lg text-fv-slate">{label}</p>
      <Button type="button" variant="outline" onClick={onClear}>
        Clear Search
      </Button>
    </div>
  );
}
