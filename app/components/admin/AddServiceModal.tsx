'use client';

import { useState, useEffect, useMemo } from 'react';
import { Formik, Form, setIn } from 'formik';
import * as Yup from 'yup';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Service, ProcessStep, FAQ } from '@/app/types/services';
import ServiceFormStep1 from './ServiceFormStep1';
import ServiceFormStep2 from './ServiceFormStep2';
import ServiceFormStep3 from './ServiceFormStep3';
import ServiceFormStep4 from './ServiceFormStep4';
import ServiceFormStep5 from './ServiceFormStep5';
import { serviceService } from '@/app/lib/api';
import { API_CONFIG } from '@/app/lib/api/config';
import { apiPost, apiPut } from '@/app/lib/api/axios';
import * as lucideIcons from 'lucide-react';

// Icon mapping helper
function getIconFromName(iconName: string) {
  const IconComponent = (lucideIcons as any)[iconName];
  return IconComponent || lucideIcons.FileText;
}

// Get icon name from icon component (for editing)
function getIconNameFromComponent(icon: any): string {
  if (!icon) return 'FileText';
  // Try to get the display name or name from the component
  const name = icon.displayName || icon.name || 'FileText';
  // Remove common suffixes
  return name.replace(/Icon$/, '').replace(/Component$/, '');
}

const step1Schema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  category: Yup.string().required('Category is required'),
  subcategory: Yup.string().when('category', {
    is: (val: string) => val === 'IPO' || val === 'Legal' || val === 'Banking & Finance',
    then: (schema) => schema.required('Subcategory is required for this category'),
    otherwise: (schema) => schema,
  }),
  iconName: Yup.string().required('Icon is required'),
  shortDescription: Yup.string().min(10, 'Short description must be at least 10 characters').required('Short description is required'),
  longDescription: Yup.string().min(50, 'Long description must be at least 50 characters').required('Long description is required'),
});

const step2Schema = Yup.object().shape({
  price: Yup.object().shape({
    min: Yup.number().min(0, 'Min price must be 0 or greater').required('Min price is required'),
    max: Yup.number().min(Yup.ref('min'), 'Max price must be greater than min price').required('Max price is required'),
    currency: Yup.string().required('Currency is required'),
  }),
  duration: Yup.string().required('Duration is required'),
});

const step3Schema = Yup.object().shape({
  features: Yup.array().of(Yup.string()).min(1, 'At least one feature is required').required('Features are required'),
  benefits: Yup.array().of(Yup.string()).min(1, 'At least one benefit is required').required('Benefits are required'),
});

const step4Schema = Yup.object().shape({
  process: Yup.array()
    .of(
      Yup.object().shape({
        step: Yup.number().required(),
        title: Yup.string().required('Step title is required'),
        description: Yup.string().required('Step description is required'),
        duration: Yup.string().required('Step duration is required'),
      })
    )
    .min(1, 'At least one process step is required')
    .required('Process steps are required'),
  requirements: Yup.array().of(Yup.string()),
});

const step5Schema = Yup.object().shape({
  faqs: Yup.array().of(
    Yup.object().shape({
      id: Yup.string(),
      question: Yup.string(),
      answer: Yup.string(),
    })
  ),
  relatedServices: Yup.array().of(Yup.string()),
});

const allSchemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema];

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingService?: Service | null;
  defaultCategory?: string;
}

export default function AddServiceModal({ isOpen, onClose, editingService, defaultCategory }: AddServiceModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  // Map category slug to category display name
  const getCategoryNameFromSlug = (slug: string): string => {
    const categoryMap: Record<string, string> = {
      'gst': 'GST',
      'income-tax': 'Income Tax',
      'registration': 'Registration',
      'trademarks': 'Trademarks',
      'ipo': 'IPO',
      'legal': 'Legal',
      'banking-finance': 'Banking & Finance',
    };
    return categoryMap[slug.toLowerCase()] || '';
  };

  const getInitialValues = (): any => {
    if (editingService) {
      return {
        id: editingService.id,
        slug: editingService.slug,
        title: editingService.title,
        shortDescription: editingService.shortDescription,
        longDescription: editingService.longDescription,
        category: editingService.category,
        subcategory: (editingService as any).subcategory || '',
        iconName: getIconNameFromComponent(editingService.icon),
        price: {
          min: editingService.price.min,
          max: editingService.price.max,
          currency: editingService.price.currency,
        },
        duration: editingService.duration,
        features: Array.isArray(editingService.features) ? editingService.features.map((f: any) => typeof f === 'string' ? f : String(f)) : [],
        benefits: Array.isArray(editingService.benefits) ? editingService.benefits.map((b: any) => typeof b === 'string' ? b : String(b)) : [],
        requirements: Array.isArray(editingService.requirements) ? editingService.requirements.map((r: any) => typeof r === 'string' ? r : String(r)) : [],
        process: Array.isArray(editingService.process) ? editingService.process.map((p: any) => ({
          step: typeof p === 'object' && p.step ? p.step : (p.step || 1),
          title: typeof p === 'object' && p.title ? p.title : '',
          description: typeof p === 'object' && p.description ? p.description : '',
          duration: typeof p === 'object' && p.duration ? p.duration : '',
        })) : [],
        faqs: editingService.faqs || [],
        relatedServices: editingService.relatedServices || [],
      };
    }
    // Return empty values for new service - default category from current page
    const defaultCategoryName = defaultCategory ? getCategoryNameFromSlug(defaultCategory) : '';
    return {
      id: `service-${Date.now()}`,
      slug: '',
      title: '',
      shortDescription: '',
      longDescription: '',
      category: defaultCategoryName, // Pre-select current category
      subcategory: '',
      iconName: '', // Empty string - no default selection
      price: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      duration: '',
      features: [],
      benefits: [],
      requirements: [],
      process: [],
      faqs: [],
      relatedServices: [],
    };
  };

  // Reset step when modal opens or editingService changes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen, editingService]);

  // Calculate initial values - recalculate when modal opens or editingService/defaultCategory changes
  const initialValues = useMemo(() => {
    return getInitialValues();
  }, [editingService, defaultCategory, isOpen]);
  
  // Create a key for Formik - change when switching between edit/new mode or when defaultCategory changes
  // This ensures the form resets with the correct default category
  const formKey = editingService 
    ? `edit-${editingService.id}` 
    : `new-${defaultCategory || 'default'}`;

  const handleSubmit = async (values: any) => {
    try {
      // Convert icon name to icon component
      const IconComponent = getIconFromName(values.iconName);
      
      // Create process steps with step numbers
      const processSteps: ProcessStep[] = (values.process || []).map((p: any, index: number) => ({
        step: index + 1,
        title: p.title,
        description: p.description,
        duration: p.duration,
      }));

      // Create FAQs with IDs
      const faqs: FAQ[] = (values.faqs || []).map((faq: any) => ({
        id: faq.id || `faq-${Date.now()}-${Math.random()}`,
        question: faq.question,
        answer: faq.answer,
      }));

      // Generate slug from title
      const slug = values.slug || values.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

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
        return categoryMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');
      };

      const categorySlug = getCategorySlug(values.category);

      // Create service DTO for API (without category/subcategory in body for subcategory endpoint)
      const serviceDto: any = {
        title: values.title,
        shortDescription: values.shortDescription,
        longDescription: values.longDescription,
        iconName: values.iconName,
        price: {
          min: Number(values.price.min),
          max: Number(values.price.max),
          currency: values.price.currency || 'INR',
        },
        duration: values.duration,
        features: values.features || [],
        benefits: values.benefits || [],
        requirements: values.requirements || [],
        process: processSteps,
        faqs,
        relatedServices: values.relatedServices || [],
      };

      // Save service via API
      if (editingService && editingService.id) {
        // For updates, use the standard update endpoint
        await serviceService.update(editingService.id, {
          ...serviceDto,
          slug,
          category: categorySlug,
          subcategory: values.subcategory || undefined,
        });
      } else {
        // For new services, use subcategory endpoint if subcategory exists
        if (values.subcategory) {
          // Use POST /api/services/:category/:subcategory/:slug
          await apiPost(`/services/${categorySlug}/${values.subcategory}/${slug}`, serviceDto);
        } else {
          // Use standard POST /api/services for simple categories
          await serviceService.create({
            ...serviceDto,
            slug,
            category: categorySlug,
          });
        }
      }
      
      toast.success(editingService ? 'Service updated successfully!' : 'Service created successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Error saving service. Please try again.');
    }
  };

  const validateCurrentStep = async (values: any) => {
    try {
      await allSchemas[currentStep].validate(values, { abortEarly: false });
      return {};
    } catch (error: any) {
      const errors: any = {};
      if (error.inner) {
        error.inner.forEach((err: any) => {
          errors[err.path] = err.message;
        });
      }
      return errors;
    }
  };

  const getStepFieldPaths = (values: any, step: number): string[] => {
    switch (step) {
      case 0:
        return [
          'title',
          'category',
          'subcategory',
          'iconName',
          'shortDescription',
          'longDescription',
        ];
      case 1:
        return ['price.min', 'price.max', 'price.currency', 'duration'];
      case 2: {
        const paths = ['features', 'benefits'];
        (values.features || []).forEach((_item: any, idx: number) => {
          paths.push(`features.${idx}`);
        });
        (values.benefits || []).forEach((_item: any, idx: number) => {
          paths.push(`benefits.${idx}`);
        });
        return paths;
      }
      case 3: {
        const paths = ['process', 'requirements'];
        (values.process || []).forEach((_step: any, idx: number) => {
          paths.push(`process.${idx}.title`);
          paths.push(`process.${idx}.description`);
          paths.push(`process.${idx}.duration`);
        });
        (values.requirements || []).forEach((_item: any, idx: number) => {
          paths.push(`requirements.${idx}`);
        });
        return paths;
      }
      case 4: {
        const paths = ['faqs', 'relatedServices'];
        (values.faqs || []).forEach((_item: any, idx: number) => {
          paths.push(`faqs.${idx}.question`);
          paths.push(`faqs.${idx}.answer`);
        });
        (values.relatedServices || []).forEach((_item: any, idx: number) => {
          paths.push(`relatedServices.${idx}`);
        });
        return paths;
      }
      default:
        return [];
    }
  };

  const markStepTouched = (values: any, step: number, existingTouched: any) => {
    const fieldPaths = getStepFieldPaths(values, step);
    return fieldPaths.reduce((acc, path) => setIn(acc, path, true), { ...existingTouched });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Formik
          key={formKey}
          initialValues={initialValues}
          validationSchema={allSchemas[currentStep]}
          validate={validateCurrentStep}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ values, errors, touched, isValid, setErrors, setTouched, submitForm }) => (
            <Form 
              className="flex-1 overflow-y-auto"
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only submit on the last step
                if (currentStep === totalSteps - 1) {
                  await submitForm();
                }
              }}
            >
              <div className="p-6">
                {currentStep === 0 && <ServiceFormStep1 />}
                {currentStep === 1 && <ServiceFormStep2 />}
                {currentStep === 2 && <ServiceFormStep3 />}
                {currentStep === 3 && <ServiceFormStep4 />}
                {currentStep === 4 && <ServiceFormStep5 />}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900">
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep > 0) {
                      setCurrentStep(currentStep - 1);
                    }
                  }}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {currentStep < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const nextTouched = markStepTouched(values, currentStep, touched);
                        setTouched(nextTouched, true);
                        // Validate current step before proceeding
                        const stepErrors = await validateCurrentStep(values);
                        if (!stepErrors || Object.keys(stepErrors).length === 0) {
                          // Clear any previous errors
                          setErrors({});
                          // Move to next step
                          setCurrentStep(currentStep + 1);
                        } else {
                          // Set validation errors
                          setErrors(stepErrors);
                          console.log('Validation errors:', stepErrors);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                      Next
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                      {editingService ? 'Update Service' : 'Create Service'}
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

