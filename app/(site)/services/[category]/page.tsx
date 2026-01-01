'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { serviceService } from '@/app/lib/api';
import { convertApiServiceToDisplay, getIconFromName } from '@/app/lib/utils/apiDataConverter';
import ServiceCard from '@/app/components/services/ServiceCard';
import ScrollReveal from '@/app/components/animations/ScrollReveal';
import StaggerContainer, { StaggerItem } from '@/app/components/animations/StaggerContainer';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import { Search, CheckCircle, Users, Shield, Zap, Loader2, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_CONFIG } from '@/app/lib/api/config';

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
        console.log('categoryResponse', categoryResponse);

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
                // Fetch all services for this category to get accurate counts
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
                  
                  // Count services per subcategory
                  const subCategoryCountMap = new Map<string, number>();
                  
                  allServices.forEach((service: any) => {
                    if (service.categoryInfo && service.categoryInfo.categoryType === category) {
                      const subCatSlug = service.categoryInfo.slug;
                      if (subCatSlug) {
                        subCategoryCountMap.set(subCatSlug, (subCategoryCountMap.get(subCatSlug) || 0) + 1);
                      }
                    }
                  });
                  
                  // Update service counts with actual counts
                  const updatedSubCategoriesList = subCategoriesList.map((subCat: SubCategory) => ({
                    ...subCat,
                    serviceCount: subCategoryCountMap.get(subCat.slug) || subCat.serviceCount || 0,
                  }));
                  
                  setSubCategories(updatedSubCategoriesList);
                } else {
                  // If fetching fails, use the original list
                  setSubCategories(subCategoriesList);
                }
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

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubCategories = subCategories.filter(
    (subCat) =>
      subCat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subCat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || (!hasSubcategories && services.length === 0) || (hasSubcategories && subCategories.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No data found'}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const CategoryIcon = categoryInfo ? getIconFromName(categoryInfo.iconName) || FileText : FileText;

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-blue to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl mb-6">
              <CategoryIcon className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary mb-4">
              {categoryInfo?.heroTitle || categoryInfo?.title || `${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Services`}
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              {categoryInfo?.heroDescription || categoryInfo?.description || `Comprehensive ${category.replace(/-/g, ' ')} solutions for your business`}
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder={`Search ${hasSubcategories ? 'categories' : 'services'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefixIcon={<Search className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Stats */}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {hasSubcategories ? (
          <>
            {/* Subcategories Grid for Complex Categories */}
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl text-primary mb-3">
                Our {categoryInfo?.title || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Categories
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore our specialized service categories
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredSubCategories.map((subCategory) => {
                const SubCategoryIcon = getIconFromName(subCategory.iconName) || FileText;
                return (
                  <StaggerItem key={subCategory.id}>
                    <Link href={`/services/${category}/${subCategory.slug}`}>
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="bg-white rounded-xl shadow-card p-6 h-full flex flex-col group cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all"
                      >
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl mb-4 group-hover:scale-110 transition-transform">
                          <SubCategoryIcon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-heading font-semibold text-xl text-primary mb-2 group-hover:text-accent transition-colors">
                          {subCategory.title}
                        </h3>
                        <p className="text-gray-600 mb-4 flex-grow text-sm">
                          {subCategory.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-primary">
                              {subCategory.serviceCount} {subCategory.serviceCount === 1 ? 'Service' : 'Services'}
                            </span>
                          </div>
                          <motion.div
                            className="flex items-center text-accent font-medium text-sm"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            Explore
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* No Results */}
            {filteredSubCategories.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-600 text-lg mb-4">
                  No categories found matching your search.
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
          </>
        ) : (
          <>
            {/* Services Grid for Simple Categories */}
            <div className="text-center mb-12">
              <h2 className="font-heading font-bold text-3xl text-primary mb-3">
                Our {categoryInfo?.title || category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')} Services
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose from our comprehensive range of services tailored to your business needs
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredServices.map((service) => {
                return (
                  <StaggerItem key={service.id}>
                    <ServiceCard
                      title={service.title}
                      shortDescription={service.shortDescription}
                      icon={service.icon}
                      price={service.price}
                      duration={service.duration}
                      slug={service.slug}
                      category={category}
                    />
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* No Results */}
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
          </>
        )}

        {/* Why Choose Us */}
        <ScrollReveal direction="up">
          <div className="mt-20 bg-white rounded-2xl shadow-card p-8 md:p-12">
            <h2 className="font-heading font-bold text-3xl text-primary mb-8 text-center">
              Why Choose ClearTax?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Expert CA Team',
                  description:
                    'Our team of experienced Chartered Accountants ensures 100% accurate compliance.',
                  icon: Users,
                },
                {
                  title: 'Quick Processing',
                  description:
                    'Fast turnaround time with most services completed within the specified timeline.',
                  icon: Zap,
                },
                {
                  title: 'Secure & Reliable',
                  description:
                    'Your data is safe with us. Bank-grade security and complete confidentiality.',
                  icon: Shield,
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl mb-4">
                    <feature.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal direction="up">
          <div className="mt-16 bg-gradient-to-r from-accent to-primary rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="font-heading font-bold text-3xl mb-4">
              Need Help Choosing the Right Service?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Our experts are here to help you understand which service best fits your business needs.
              Get a free consultation today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg">
                Schedule Free Consultation
              </Button>
              <a href="tel:+918800000000">
                <Button variant="tertiary" size="lg">
                  Call +91 8800000000
                </Button>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
