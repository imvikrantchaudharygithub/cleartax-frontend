'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import ServiceCategorySection from '@/app/components/admin/ServiceCategorySection';
import AddServiceModal from '@/app/components/admin/AddServiceModal';
import AddSubcategoryModal from '@/app/components/admin/AddSubcategoryModal';
import EditCategoryDetailsModal, { EditableCategory } from '@/app/components/admin/EditCategoryDetailsModal';
import { Service, ServiceCategory } from '@/app/types/services';
import { serviceService } from '@/app/lib/api';
import { API_CONFIG } from '@/app/lib/api/config';
import { useConfirm } from '@/app/components/admin/ConfirmDialog';
import toast from 'react-hot-toast';
import * as lucideIcons from 'lucide-react';

/** Admin must see draft + published; public API defaults to published only. */
const ADMIN_SERVICES_QUERY = 'includeDrafts=true';

// lucide-react also exports non-renderable helpers/base components (e.g. the base
// `Icon`, which does `iconNode.map(...)` and crashes without an `iconNode` prop).
// Treat those as "no icon" so a bad iconName can't take down the page.
const NON_ICON_EXPORTS = new Set(['Icon', 'LucideIcon', 'createLucideIcon', 'icons', 'default']);

// Helper to get icon component from name
function getIconFromName(iconName: string) {
  if (!iconName || NON_ICON_EXPORTS.has(iconName)) return lucideIcons.FileText;
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
    iconName: apiCategory.iconName || 'FileText',
    icon: getIconFromName(apiCategory.iconName),
    heroTitle: apiCategory.heroTitle,
    heroDescription: apiCategory.heroDescription,
    whyChooseSection: apiCategory.whyChooseSection,
    heroStats: apiCategory.heroStats,
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
      status: service.status,
    })),
  };
}

export default function AdminCategoryServicesPage() {
  const params = useParams();
  const categorySlug = params?.category as string;
  const confirm = useConfirm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddSubcategoryModalOpen, setIsAddSubcategoryModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<EditableCategory | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryData = useCallback(
    async (showLoader = true) => {
      if (!categorySlug) return;
      try {
        if (showLoader) setLoading(true);
        setError(null);

        // Always fetch via /services/:category so we receive category details + current services.
        const categoryResponse = await fetch(
          `${API_CONFIG.BASE_URL}/services/${categorySlug}?${ADMIN_SERVICES_QUERY}`,
          { cache: 'no-store' }
        );

        if (!categoryResponse.ok) {
          throw new Error(`Failed to fetch category: ${categoryResponse.status}`);
        }

        const categoryData = await categoryResponse.json();
        if (!categoryData.success) {
          throw new Error(categoryData.message || 'Failed to fetch category');
        }

        if (
          categoryData.category?.hasSubcategories === true &&
          Array.isArray(categoryData.subcategories) &&
          categoryData.subcategories.length > 0
        ) {
          const subcategoriesWithServices = await Promise.all(
            categoryData.subcategories.map(async (subCat: any) => {
              try {
                const subcategoryServicesResponse = await fetch(
                  `${API_CONFIG.BASE_URL}/services/${categorySlug}/${subCat.slug}?${ADMIN_SERVICES_QUERY}`,
                  { cache: 'no-store' }
                );

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
                  whyChooseSection: subCat.whyChooseSection,
                  heroStats: subCat.heroStats,
                  services,
                };
              } catch (subErr) {
                console.error(`Error fetching services for subcategory ${subCat.slug}:`, subErr);
                return {
                  _id: subCat._id || subCat.id,
                  id: subCat._id || subCat.id,
                  slug: subCat.slug,
                  title: subCat.title,
                  description: subCat.shortDescription || subCat.description || '',
                  iconName: subCat.iconName || 'FileText',
                  heroTitle: subCat.title,
                  heroDescription: subCat.shortDescription || subCat.description || '',
                  whyChooseSection: subCat.whyChooseSection,
                  heroStats: subCat.heroStats,
                  services: [],
                };
              }
            })
          );

          setCategories(subcategoriesWithServices.map(convertApiCategoryToDisplay));
          return;
        }

        const services = Array.isArray(categoryData.data) ? categoryData.data : [];
        const categoryObj = {
          _id: categoryData.category?._id || categorySlug,
          id: categoryData.category?._id || categorySlug,
          slug: categoryData.category?.slug || categorySlug,
          title: categoryData.category?.title || categorySlug,
          description: categoryData.category?.description || '',
          iconName: categoryData.category?.iconName || 'FileText',
          heroTitle: categoryData.category?.heroTitle || categoryData.category?.title || categorySlug,
          heroDescription: categoryData.category?.heroDescription || categoryData.category?.description || '',
          whyChooseSection: categoryData.category?.whyChooseSection,
          heroStats: categoryData.category?.heroStats,
          services,
        };

        setCategories([convertApiCategoryToDisplay(categoryObj)]);
      } catch (err: any) {
        console.error('Error fetching services:', err);
        setError(err.message || 'Failed to load services');
        toast.error('Failed to load services. Please try again.');
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [categorySlug]
  );

  useEffect(() => {
    void fetchCategoryData(true);
  }, [fetchCategoryData]);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    const ok = await confirm({
      title: 'Delete this service?',
      message: 'This permanently removes the service. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
    });
    if (!ok) {
      return;
    }

    try {
      await serviceService.delete(serviceId);
      toast.success('Service deleted successfully!');
      await fetchCategoryData(false);
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service. Please try again.');
    }
  };

  const handlePublish = async (service: Service) => {
    const ok = await confirm({
      title: `Publish "${service.title}"?`,
      message: 'This makes the service live and visible to everyone on the public site.',
      confirmLabel: 'Publish',
      variant: 'success',
    });
    if (!ok) {
      return;
    }
    try {
      await serviceService.publishDraft(service.id);
      toast.success(`"${service.title}" is now live on the site.`);
      await fetchCategoryData(false);
    } catch (error: any) {
      console.error('Error publishing service:', error);
      // publishDraft validates required fields server-side; surface that message.
      const message = error?.response?.data?.message || error?.message || 'Failed to publish service.';
      toast.error(message);
    }
  };

  const handleUnpublish = async (service: Service) => {
    const ok = await confirm({
      title: `Unpublish "${service.title}"?`,
      message: 'It will be removed from the public site and kept as a draft. You can publish it again anytime.',
      confirmLabel: 'Unpublish',
      variant: 'warning',
    });
    if (!ok) {
      return;
    }
    try {
      await serviceService.unpublish(service.id);
      toast.success(`"${service.title}" unpublished (now a draft).`);
      await fetchCategoryData(false);
    } catch (error: any) {
      console.error('Error unpublishing service:', error);
      toast.error('Failed to unpublish service. Please try again.');
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

  const handleEditCategoryContent = (category: ServiceCategory) => {
    // Edit the public category page content (hero, stats, why-choose, description).
    // Routing keys (id/slug/categoryType) are intentionally not editable here.
    setEditingCategory({
      _id: category.id, // convertApiCategoryToDisplay maps Mongo _id into `id`
      id: category.id,
      slug: category.slug,
      title: category.title,
      description: category.description,
      iconName: (category as any).iconName || 'FileText',
      heroTitle: category.heroTitle,
      heroDescription: category.heroDescription,
      whyChooseSection: category.whyChooseSection,
      heroStats: category.heroStats,
    });
  };

  const handleCloseEditCategory = async () => {
    setEditingCategory(null);
    await fetchCategoryData(false);
  };

  const handleCloseSubcategoryModal = async () => {
    setIsAddSubcategoryModalOpen(false);
    setEditingSubcategory(null);
    await fetchCategoryData(false);
  };

  const availableServices = useMemo(() => {
    const list: { id: string; title: string; slug: string; requirements: string[] }[] = [];
    const seenIds = new Set<string>();
    categories.forEach((cat) => {
      (cat.services || []).forEach((svc) => {
        if (editingService && (svc.id === editingService.id || svc.slug === editingService.slug)) return;
        if (seenIds.has(svc.id)) return;
        seenIds.add(svc.id);
        list.push({
          id: svc.id,
          title: svc.title,
          slug: svc.slug,
          requirements: Array.isArray(svc.requirements)
            ? svc.requirements.map((r: unknown) => (typeof r === 'string' ? r : String(r ?? '')))
            : [],
        });
      });
    });
    return list;
  }, [categories, editingService]);

  const handleCloseModal = async () => {
    setIsAddModalOpen(false);
    setEditingService(null);
    await fetchCategoryData(false);
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
            Manage {categories[0]?.title || 'services'} - {(() => {
              const all = categories.flatMap((cat) => cat.services || []);
              const drafts = all.filter((s) => s.status === 'draft').length;
              const live = all.length - drafts;
              return drafts > 0 ? `${live} live · ${drafts} draft` : `${all.length} services`;
            })()}
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
            onEditCategory={handleEditCategoryContent}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
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
          availableServices={availableServices}
        />
      )}

      {isAddSubcategoryModalOpen && (
        <AddSubcategoryModal
          isOpen={isAddSubcategoryModalOpen}
          onClose={handleCloseSubcategoryModal}
          categoryType={categorySlug}
          editingSubcategory={editingSubcategory}
        />
      )}

      {editingCategory && (
        <EditCategoryDetailsModal
          isOpen={!!editingCategory}
          category={editingCategory}
          onClose={handleCloseEditCategory}
        />
      )}
    </div>
  );
}
