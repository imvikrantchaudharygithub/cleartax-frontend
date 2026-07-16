'use client';

import { useState, useEffect, useRef } from 'react';
import { Field, ErrorMessage, useFormikContext, getIn } from 'formik';
import { Service } from '@/app/types/services';
import { API_CONFIG } from '@/app/lib/api/config';
import * as lucideIcons from 'lucide-react';
import toast from 'react-hot-toast';
import { serviceService } from '@/app/lib/api';
import { useConfirm } from './ConfirmDialog';

// lucide exports a few non-renderable helpers/base components (e.g. the base `Icon`,
// which does `iconNode.map(...)`); rendering one as an icon crashes the form.
const NON_RENDERABLE_ICONS = new Set(['Icon', 'LucideIcon', 'createLucideIcon', 'icons', 'default']);

const categories = [
  { value: 'GST', label: 'GST' },
  { value: 'Income Tax', label: 'Income Tax' },
  { value: 'Registration', label: 'Registration' },
  { value: 'Trademarks', label: 'Trademarks' },
  { value: 'IPO', label: 'IPO' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Banking & Finance', label: 'Banking & Finance' },
];

const commonIcons = Array.from(new Set([
  'Receipt', 'FileText', 'Calculator', 'Building2', 'Award', 'Scale',
  'Briefcase', 'Shield', 'CheckCircle', 'Users', 'Zap', 'TrendingUp',
  'Landmark', 'Banknote', 'Percent', 'BadgeCheck', 'FileBadge', 'Stamp',
  'ClipboardCheck', 'FileCheck', 'FileSearch', 'FileSpreadsheet', 'Wallet',
  'CircleDollarSign', 'CreditCard', 'Library', 'Gavel', 'Building',
  'BadgeDollarSign', 'ChartBar', 'ChartLine', 'ChartPie', 'Coins', 'IndianRupee',
  'HandCoins', 'PiggyBank', 'ReceiptIndianRupee', 'CirclePercent',
  'FilePenLine', 'FileChartColumn', 'FileClock', 'FolderSearch',
  'ShieldCheck', 'ShieldAlert', 'BriefcaseBusiness',
  'BuildingOffice', 'BuildingStore', 'Store',
  'WalletCards', 'WalletMinimal', 'TicketCheck',
  'BadgePercent', 'Banknote', 'CircleCheck', 'CircleHelp',
  'ClipboardList', 'ClipboardSignature', 'DollarSign', 'Handshake',
  'NotebookPen', 'Scan', 'ShieldHalf', 'ShieldQuestion',
  'Signature', 'Stamp', 'TicketPercent', 'UserCheck',
  'UsersRound', 'FolderCheck', 'FolderClock', 'FolderKey',
]));

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

interface ServiceFormStep1Props {
  isGenerating: boolean;
  onGeneratingChange: (value: boolean) => void;
}

export default function ServiceFormStep1({ isGenerating, onGeneratingChange }: ServiceFormStep1Props) {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateField, setValues } = useFormikContext<any>();
  const [subcategories, setSubcategories] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const iconMenuRef = useRef<HTMLDivElement | null>(null);

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
    const nextValue = e.target.value;
    setFieldValue('category', nextValue);
    setFieldValue('subcategory', '');
    setFieldTouched('category', true, false);
    setFieldTouched('subcategory', true, false);
    void validateField('category');
    void validateField('subcategory');
  };

  const handleFieldChange = (name: string, value: string) => {
    setFieldValue(name, value);
    setFieldTouched(name, true, false);
    void validateField(name);
  };

  const getFieldClassName = (name: string) => {
    const hasError = Boolean(getIn(errors, name));
    const isTouched = Boolean(getIn(touched, name));
    const baseClass =
      'w-full px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent';
    const stateClass = hasError && isTouched
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-700 focus:ring-primary';
    return `${baseClass} ${stateClass}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (iconMenuRef.current && !iconMenuRef.current.contains(event.target as Node)) {
        setIsIconMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const confirm = useConfirm();

  const hasExistingContent = Boolean(
    values.shortDescription?.trim() ||
      values.longDescription?.trim() ||
      (values.features?.length ?? 0) > 0 ||
      (values.benefits?.length ?? 0) > 0 ||
      (values.requirements?.length ?? 0) > 0 ||
      (values.process?.length ?? 0) > 0 ||
      (values.faqs?.length ?? 0) > 0
  );

  const handleGenerate = async () => {
    if (hasExistingContent) {
      const ok = await confirm({
        title: 'Overwrite form content?',
        message:
          'AI will replace the current descriptions, icon, pricing, features, benefits, requirements, process steps and FAQs.',
        confirmLabel: 'Overwrite',
        variant: 'warning',
      });
      if (!ok) return;
    }

    onGeneratingChange(true);
    try {
      const generated = await serviceService.generateServiceDetails({
        title: values.title?.trim() ?? '',
        category: values.category || undefined,
        subcategory: values.subcategory || undefined,
      });
      setValues({
        ...values,
        shortDescription: generated.shortDescription,
        longDescription: generated.longDescription,
        iconName: generated.iconName,
        price: generated.price,
        duration: generated.duration,
        features: generated.features,
        benefits: generated.benefits,
        requirements: generated.requirements,
        process: generated.process,
        faqs: generated.faqs,
      });
      toast.success('Form filled — review each step before publishing.');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || 'AI generation failed — please try again.'
      );
    } finally {
      onGeneratingChange(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Service Title *
        </label>
        <div className="flex gap-2">
          <Field
            name="title"
            disabled={isGenerating}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('title', e.target.value)}
            className={`${getFieldClassName('title')} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Enter service title"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (values.title?.trim().length ?? 0) < 3}
            title="Fill the whole form with AI from this title"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <lucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                Researching & filling…
              </>
            ) : (
              <>
                <lucideIcons.Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
        <ErrorMessage name="title" component="p" className="mt-1 text-sm text-red-400" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <Field
          as="select"
          name="category"
          disabled={isGenerating}
          onChange={handleCategoryChange}
          className={`${getFieldClassName('category')} disabled:opacity-50 disabled:cursor-not-allowed`}
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
            disabled={loadingSubcategories || isGenerating}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('subcategory', e.target.value)}
            className={`${getFieldClassName('subcategory')} disabled:opacity-50 disabled:cursor-not-allowed`}
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
        <div className="relative" ref={iconMenuRef}>
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => setIsIconMenuOpen((prev) => !prev)}
            className={`${getFieldClassName('iconName')} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="flex items-center gap-2">
              {values.iconName ? (() => {
                const IconComponent = NON_RENDERABLE_ICONS.has(values.iconName) ? null : (lucideIcons as any)[values.iconName];
                const ResolvedIcon = IconComponent || lucideIcons.FileText;
                return <ResolvedIcon className="w-4 h-4 text-gray-300" />;
              })() : <lucideIcons.FileText className="w-4 h-4 text-gray-500" />}
              <span className={values.iconName ? 'text-white' : 'text-gray-500'}>
                {values.iconName || 'Select icon'}
              </span>
            </span>
          </button>
          {isIconMenuOpen && (
            <div className="absolute z-10 mt-2 w-full max-h-64 overflow-auto rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
              {commonIcons.map((icon) => {
                const IconComponent = NON_RENDERABLE_ICONS.has(icon) ? null : (lucideIcons as any)[icon];
                const ResolvedIcon = IconComponent || lucideIcons.FileText;
                return (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      handleFieldChange('iconName', icon);
                      setIsIconMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <ResolvedIcon className="w-4 h-4 text-gray-300" />
                    {icon}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
          disabled={isGenerating}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('shortDescription', e.target.value)}
          className={`${getFieldClassName('shortDescription')} disabled:opacity-50 disabled:cursor-not-allowed`}
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
          disabled={isGenerating}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('longDescription', e.target.value)}
          className={`${getFieldClassName('longDescription')} disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="Detailed description (shown on service detail page)"
        />
        <ErrorMessage name="longDescription" component="p" className="mt-1 text-sm text-red-400" />
      </div>
    </div>
  );
}

