'use client';

import { useState, useEffect } from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { Service } from '@/app/types/services';
import { API_CONFIG } from '@/app/lib/api/config';

const categories = [
  { value: 'GST', label: 'GST' },
  { value: 'Income Tax', label: 'Income Tax' },
  { value: 'Registration', label: 'Registration' },
  { value: 'Trademarks', label: 'Trademarks' },
  { value: 'IPO', label: 'IPO' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Banking & Finance', label: 'Banking & Finance' },
];

const commonIcons = [
  'Receipt', 'FileText', 'Calculator', 'Building2', 'Award', 'Scale',
  'Briefcase', 'Shield', 'CheckCircle', 'Users', 'Zap', 'TrendingUp',
];

// Map category display name to API slug
const getCategorySlug = (categoryName: string): string => {
  const categoryMap: Record<string, string> = {
    'GST': 'gst',
    'Income Tax': 'income-tax',
    'Registration': 'registration',
    'Trademarks': 'trademarks',
    'IPO': 'ipo',
    'Legal': 'legal',
    'Banking & Finance': 'banking-finance',
  };
  return categoryMap[categoryName] || '';
};

export default function ServiceFormStep1() {
  const { values, errors, touched, setFieldValue } = useFormikContext<any>();
  const [subcategories, setSubcategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  const selectedCategory = values.category;
  const needsSubcategory = selectedCategory === 'IPO' || selectedCategory === 'Legal' || selectedCategory === 'Banking & Finance';

  // Fetch subcategories from API when category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!needsSubcategory || !selectedCategory) {
        setSubcategories([]);
        return;
      }

      try {
        setLoadingSubcategories(true);
        const categorySlug = getCategorySlug(selectedCategory);
        
        if (!categorySlug) {
          setSubcategories([]);
          return;
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}/services/${categorySlug}`, {
          next: { revalidate: 60 },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.subcategories && Array.isArray(data.subcategories)) {
            const subcats = data.subcategories.map((subCat: any) => ({
              value: subCat.slug || subCat._id || subCat.id,
              label: subCat.title || subCat.name,
            }));
            setSubcategories(subcats);
          } else {
            setSubcategories([]);
          }
        } else {
          setSubcategories([]);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubcategories([]);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, [selectedCategory, needsSubcategory]);

  // Reset subcategory when category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue('category', e.target.value);
    setFieldValue('subcategory', '');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Service Title *
        </label>
        <Field
          name="title"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Enter service title"
        />
        <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <Field
          as="select"
          name="category"
          onChange={handleCategoryChange}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </Field>
        <ErrorMessage name="category" component="p" className="mt-1 text-sm text-red-400" />
      </div>

      {needsSubcategory && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subcategory *
          </label>
          <Field
            as="select"
            name="subcategory"
            disabled={loadingSubcategories}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingSubcategories ? 'Loading subcategories...' : 'Select subcategory'}
            </option>
            {subcategories.map((subcat) => (
              <option key={subcat.value} value={subcat.value}>
                {subcat.label}
              </option>
            ))}
          </Field>
          <ErrorMessage name="subcategory" component="p" className="mt-1 text-sm text-red-400" />
          <p className="mt-1 text-xs text-gray-500">
            Select the {selectedCategory} subcategory this service belongs to
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Icon Name *
        </label>
        <Field
          as="select"
          name="iconName"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Select icon</option>
          {commonIcons.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </Field>
        <ErrorMessage name="iconName" component="p" className="mt-1 text-sm text-red-400" />
        <p className="mt-1 text-xs text-gray-500">Icon will be mapped from lucide-react</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Short Description *
        </label>
        <Field
          as="textarea"
          name="shortDescription"
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Brief description (shown in service cards)"
        />
        <ErrorMessage name="shortDescription" component="p" className="mt-1 text-sm text-red-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Long Description *
        </label>
        <Field
          as="textarea"
          name="longDescription"
          rows={5}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Detailed description (shown on service detail page)"
        />
        <ErrorMessage name="longDescription" component="p" className="mt-1 text-sm text-red-400" />
      </div>
    </div>
  );
}

