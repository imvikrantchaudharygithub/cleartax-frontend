'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, getIn } from 'formik';
import * as Yup from 'yup';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { IPOCategory } from '@/app/types/ipo';
import { LegalCategory } from '@/app/types/legal';
import { BankingFinanceCategory } from '@/app/types/banking-finance';
import { serviceService } from '@/app/lib/api';
import { API_CONFIG } from '@/app/lib/api/config';
import { apiPut } from '@/app/lib/api/axios';
import * as lucideIcons from 'lucide-react';

const commonIcons = [
  'Receipt', 'FileText', 'Calculator', 'Building2', 'Award', 'Scale',
  'Briefcase', 'Shield', 'CheckCircle', 'Users', 'Zap', 'TrendingUp',
  'FileSearch', 'DollarSign', 'RefreshCw', 'BarChart3', 'FileCheck',
];

const validationSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
  iconName: Yup.string().required('Icon is required'),
  heroTitle: Yup.string().min(3, 'Hero title is required').required('Hero title is required'),
  heroDescription: Yup.string().min(20, 'Hero description must be at least 20 characters').required('Hero description is required'),
});

interface AddSubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryType: 'ipo' | 'legal' | 'banking-finance';
  editingSubcategory?: IPOCategory | LegalCategory | BankingFinanceCategory | null;
}

export default function AddSubcategoryModal({ isOpen, onClose, categoryType, editingSubcategory }: AddSubcategoryModalProps) {
  if (!isOpen) return null;

  const getIconFromName = (iconName: string) => {
    const IconComponent = (lucideIcons as any)[iconName];
    return IconComponent || lucideIcons.FileText;
  };

  const initialValues = editingSubcategory ? {
    id: editingSubcategory.id,
    slug: editingSubcategory.slug,
    title: editingSubcategory.title,
    description: editingSubcategory.description,
    iconName: (editingSubcategory as any).iconName || 'FileText',
    heroTitle: editingSubcategory.heroTitle,
    heroDescription: editingSubcategory.heroDescription,
  } : {
    id: `subcategory-${Date.now()}`,
    slug: '',
    title: '',
    description: '',
    iconName: '',
    heroTitle: '',
    heroDescription: '',
  };

  const handleSubmit = async (values: any) => {
    try {
      const slug = values.slug || values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const subcategoryData: any = {
        id: slug,
        slug,
        title: values.title,
        description: values.description,
        shortDescription: values.description,
        iconName: values.iconName,
        heroTitle: values.heroTitle,
        heroDescription: values.heroDescription,
        categoryType: categoryType,
        subServices: editingSubcategory ? (editingSubcategory as any).subServices || [] : [],
      };

      if (editingSubcategory) {
        // Update subcategory via API - use PUT /api/services/categories/:id
        const categoryId = (editingSubcategory as any)._id || editingSubcategory.id;
        await apiPut(`/services/categories/${categoryId}`, subcategoryData);
        toast.success('Subcategory updated successfully!');
      } else {
        // Create subcategory via API
        await serviceService.createCategory(subcategoryData);
        toast.success('Subcategory created successfully!');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving subcategory:', error);
      toast.error(error?.message || 'Error saving subcategory. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {editingSubcategory ? 'Edit Subcategory' : `Add New ${categoryType.toUpperCase()} Subcategory`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue, setFieldTouched, validateField, setTouched }) => {
            const handleFieldChange = (name: string, value: string) => {
              setFieldValue(name, value);
              setFieldTouched(name, true, false);
              void validateField(name);
            };

            const getFieldClassName = (name: string) => {
              const hasError = Boolean(getIn(errors, name));
              const isTouched = Boolean(getIn(touched, name));
              const baseClass =
                'w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent';
              const stateClass = hasError && isTouched
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-primary';
              return `${baseClass} ${stateClass}`;
            };

            const markAllTouched = () => {
              setTouched(
                {
                  title: true,
                  description: true,
                  iconName: true,
                  heroTitle: true,
                  heroDescription: true,
                },
                true
              );
            };

            return (
            <Form className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subcategory Title *
                  </label>
                  <Field
                    name="title"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
                    className={getFieldClassName('title')}
                    placeholder="Enter subcategory title"
                  />
                  <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('description', e.target.value)}
                    className={getFieldClassName('description')}
                    placeholder="Enter subcategory description"
                  />
                  <ErrorMessage name="description" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon Name *
                  </label>
                  <Field
                    as="select"
                    name="iconName"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('iconName', e.target.value)}
                    className={getFieldClassName('iconName')}
                  >
                    <option value="">Select icon</option>
                    {commonIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="iconName" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hero Title *
                  </label>
                  <Field
                    name="heroTitle"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('heroTitle', e.target.value)}
                    className={getFieldClassName('heroTitle')}
                    placeholder="Enter hero title"
                  />
                  <ErrorMessage name="heroTitle" component="p" className="mt-1 text-sm text-red-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hero Description *
                  </label>
                  <Field
                    as="textarea"
                    name="heroDescription"
                    rows={4}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('heroDescription', e.target.value)}
                    className={getFieldClassName('heroDescription')}
                    placeholder="Enter hero description"
                  />
                  <ErrorMessage name="heroDescription" component="p" className="mt-1 text-sm text-red-400" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-700 bg-gray-900">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => markAllTouched()}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                >
                  {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                </button>
              </div>
            </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

