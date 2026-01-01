'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import ServiceCategorySection from '@/app/components/admin/ServiceCategorySection';
import AddServiceModal from '@/app/components/admin/AddServiceModal';
import AddSubcategoryModal from '@/app/components/admin/AddSubcategoryModal';
import { Service, ServiceCategory } from '@/app/types/services';
import { serviceService } from '@/app/lib/api';
import { API_CONFIG } from '@/app/lib/api/config';
import toast from 'react-hot-toast';
import * as lucideIcons from 'lucide-react';

// Helper to get icon component from name
function getIconFromName(iconName: string) {
  if (!iconName) return lucideIcons.FileText;
  const IconComponent = (lucideIcons as any)[iconName];
  return IconComponent || lucideIcons.FileText;
}

// Convert API ServiceCategory to display format
function convertApiCategoryToDisplay(apiCategory: any): ServiceCategory {
  return {
    id: apiCategory._id || apiCategory.id,
    slug: apiCategory.slug,
    title: apiCategory.title,
    description: apiCategory.description,
    icon: getIconFromName(apiCategory.iconName),
    heroTitle: apiCategory.heroTitle,
    heroDescription: apiCategory.heroDescription,
    services: (apiCategory.services || []).map((service: any) => ({
      id: service._id || service.id,
      slug: service.slug,
      title: service.title,
      shortDescription: service.shortDescription,
      longDescription: service.longDescription,
      icon: getIconFromName(service.iconName),
      category: service.category,
      price: service.price,
      duration: service.duration,
      features: service.features || [],
      benefits: service.benefits || [],
      requirements: service.requirements || [],
      process: service.process || [],
      faqs: service.faqs || [],
      relatedServices: service.relatedServices || [],
    })),
  };
}

export default function AdminCategoryServicesPage() {
  const params = useParams();
  const categorySlug = params?.category as string;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and services from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For complex categories (legal, ipo, banking-finance), fetch subcategories with services
        if (categorySlug === 'ipo' || categorySlug === 'legal' || categorySlug === 'banking-finance') {
          // Fetch category data which includes subcategories
          const categoryResponse = await fetch(`${API_CONFIG.BASE_URL}/services/${categorySlug}`, {
            next: { revalidate: 60 },
          });

          if (!categoryResponse.ok) {
            throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
          }

          const categoryData = await categoryResponse.json();

          if (!categoryData.success) {
            throw new Error(categoryData.message || 'Failed to fetch category');
          }

          // Check if category has subcategories
          if (categoryData.category?.hasSubcategories && categoryData.subcategories) {
            // Fetch services for each subcategory to get accurate counts
            const subcategoriesWithServices = await Promise.all(
              categoryData.subcategories.map(async (subCat: any) => {
                try {
                  const subcategoryServicesUrl = `${API_CONFIG.BASE_URL}/services/${categorySlug}/${subCat.slug}`;
                  const subcategoryServicesResponse = await fetch(subcategoryServicesUrl, {
                    next: { revalidate: 60 },
                  });

                  let services: any[] = [];
                  if (subcategoryServicesResponse.ok) {
                    const subcategoryServicesData = await subcategoryServicesResponse.json();
                    if (subcategoryServicesData.success && Array.isArray(subcategoryServicesData.data)) {
                      services = subcategoryServicesData.data;
                    }
                  }

                  return {
                    _id: subCat._id || subCat.id,
                    id: subCat._id || subCat.id,
                    slug: subCat.slug,
                    title: subCat.title,
                    description: subCat.shortDescription || subCat.description || '',
                    iconName: subCat.iconName || 'FileText',
                    heroTitle: subCat.title,
                    heroDescription: subCat.shortDescription || subCat.description || '',
                    services: services || [],
                  };
                } catch (error) {
                  console.error(`Error fetching services for subcategory ${subCat.slug}:`, error);
                  return {
                    _id: subCat._id || subCat.id,
                    id: subCat._id || subCat.id,
                    slug: subCat.slug,
                    title: subCat.title,
                    description: subCat.shortDescription || subCat.description || '',
                    iconName: subCat.iconName || 'FileText',
                    heroTitle: subCat.title,
                    heroDescription: subCat.shortDescription || subCat.description || '',
                    services: [],
                  };
                }
              })
            );

            // Convert to display format
            const displayCategories = subcategoriesWithServices.map(convertApiCategoryToDisplay);
            setCategories(displayCategories);
          } else {
            // Category has direct services (no subcategories)
            let services: any[] = [];
            if (categoryData.data && Array.isArray(categoryData.data)) {
              services = categoryData.data;
            }

            const categoryObj = {
              _id: categoryData.category?._id || categorySlug,
              id: categoryData.category?._id || categorySlug,
              slug: categoryData.category?.slug || categorySlug,
              title: categoryData.category?.title || categorySlug,
              description: categoryData.category?.description || '',
              iconName: categoryData.category?.iconName || 'FileText',
              heroTitle: categoryData.category?.heroTitle || categoryData.category?.title || categorySlug,
              heroDescription: categoryData.category?.heroDescription || categoryData.category?.description || '',
              services: services,
            };

            setCategories([convertApiCategoryToDisplay(categoryObj)]);
          }
        } else {
          // For simple categories, use existing logic
        const allCategories = await serviceService.getCategories();
        
          // Filter categories by slug
        let filteredCategories = allCategories.filter((cat: any) => {
          const slug = cat.slug?.toLowerCase();
            return slug === categorySlug.toLowerCase();
        });

        // If no categories found, try to get services by category
        if (filteredCategories.length === 0) {
          const services = await serviceService.getByCategory(categorySlug);
          if (services.length > 0) {
            // Create a category from services
            filteredCategories = [{
              _id: categorySlug,
              id: categorySlug,
              slug: categorySlug,
              title: categorySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              description: `Services for ${categorySlug}`,
              iconName: 'Briefcase',
              heroTitle: `${categorySlug} Services`,
              heroDescription: `Manage ${categorySlug} services`,
              categoryType: 'simple',
              services: services,
            }];
          }
        }

        // Convert API format to display format
        const displayCategories = filteredCategories.map(convertApiCategoryToDisplay);
        setCategories(displayCategories);
        }
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.message || 'Failed to load services');
        toast.error('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchData();
    }
  }, [categorySlug]);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await serviceService.delete(serviceId);
      toast.success('Service deleted successfully!');
      // Refresh data by re-running fetchData logic
      window.location.reload(); // Simple reload to refresh all data
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service. Please try again.');
    }
  };

  const handleAddNew = () => {
    setEditingService(null);
    setIsAddModalOpen(true);
  };

  const handleAddSubcategory = () => {
    setEditingSubcategory(null);
    setIsAddSubcategoryModalOpen(true);
  };

  const handleCloseSubcategoryModal = async () => {
    setIsAddSubcategoryModalOpen(false);
    setEditingSubcategory(null);
    // Refresh data
    window.location.reload();
  };

  const handleCloseModal = async () => {
    setIsAddModalOpen(false);
    setEditingService(null);
    
    // Refresh data after modal closes by re-running fetchData logic
    try {
      setLoading(true);
      
      // For complex categories (legal, ipo, banking-finance), fetch subcategories with services
      if (categorySlug === 'ipo' || categorySlug === 'legal' || categorySlug === 'banking-finance') {
        const categoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/services/${categorySlug}`, {
          next: { revalidate: 60 },
        });

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();

          if (categoryData.success && categoryData.category?.hasSubcategories && categoryData.subcategories) {
            const subcategoriesWithServices = await Promise.all(
              categoryData.subcategories.map(async (subCat: any) => {
                try {
                  const subcategoryServicesUrl = `${API_CONFIG.BASE_URL}/services/${categorySlug}/${subCat.slug}`;
                  const subcategoryServicesResponse = await fetch(subcategoryServicesUrl, {
                    next: { revalidate: 60 },
                  });

                  let services: any[] = [];
                  if (subcategoryServicesResponse.ok) {
                    const subcategoryServicesData = await subcategoryServicesResponse.json();
                    if (subcategoryServicesData.success && Array.isArray(subcategoryServicesData.data)) {
                      services = subcategoryServicesData.data;
                    }
                  }

                  return {
                    _id: subCat._id || subCat.id,
                    id: subCat._id || subCat.id,
                    slug: subCat.slug,
                    title: subCat.title,
                    description: subCat.shortDescription || subCat.description || '',
                    iconName: subCat.iconName || 'FileText',
                    heroTitle: subCat.title,
                    heroDescription: subCat.shortDescription || subCat.description || '',
                    services: services || [],
                  };
                } catch (error) {
                  return {
                    _id: subCat._id || subCat.id,
                    id: subCat._id || subCat.id,
                    slug: subCat.slug,
                    title: subCat.title,
                    description: subCat.shortDescription || subCat.description || '',
                    iconName: subCat.iconName || 'FileText',
                    heroTitle: subCat.title,
                    heroDescription: subCat.shortDescription || subCat.description || '',
                    services: [],
                  };
                }
              })
            );

            const displayCategories = subcategoriesWithServices.map(convertApiCategoryToDisplay);
            setCategories(displayCategories);
          }
        }
      } else {
        // For simple categories
      const allCategories = await serviceService.getCategories();
      const filteredCategories = allCategories.filter((cat: any) => {
        const slug = cat.slug?.toLowerCase();
          return slug === categorySlug.toLowerCase();
      });
      const displayCategories = filteredCategories.map(convertApiCategoryToDisplay);
      setCategories(displayCategories);
      }
    } catch (error) {
      console.error('Error refreshing services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">No Services Found</h1>
          <p className="text-gray-400">
            No services found for this category. You may need to{' '}
            <a href="/admin/migrate" className="text-primary hover:underline">
              migrate dummy data to API
            </a>{' '}
            first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Services Management</h1>
          <p className="text-gray-400">
            Manage {categories[0]?.title || 'services'} - {categories.reduce((sum, cat) => sum + cat.services.length, 0)} services
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(categorySlug === 'ipo' || categorySlug === 'legal' || categorySlug === 'banking-finance') && (
            <button
              onClick={handleAddSubcategory}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Subcategory
            </button>
          )}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New Service
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <ServiceCategorySection
            key={category.id}
            category={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
            categoryType={categorySlug === 'ipo' || categorySlug === 'legal' || categorySlug === 'banking-finance' ? categorySlug as 'ipo' | 'legal' | 'banking-finance' : 'simple'}
          />
        ))}
      </div>

      {isAddModalOpen && (
        <AddServiceModal
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          editingService={editingService}
          defaultCategory={categorySlug}
        />
      )}

      {isAddSubcategoryModalOpen && (
        <AddSubcategoryModal
          isOpen={isAddSubcategoryModalOpen}
          onClose={handleCloseSubcategoryModal}
          categoryType={categorySlug as 'ipo' | 'legal' | 'banking-finance'}
          editingSubcategory={editingSubcategory}
        />
      )}
    </div>
  );
}
