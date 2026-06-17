'use client';

import { useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiPut } from '@/app/lib/api/axios';
import IconPicker from './IconPicker';
import {
  DEFAULT_HERO_STATS,
  DEFAULT_WHY_CHOOSE_SECTION,
  HeroStatItem,
  WhyChooseItem,
} from '@/app/lib/constants/categoryDefaults';

export interface EditableCategory {
  _id?: string;
  id: string;
  slug?: string;
  title: string;
  description?: string;
  iconName?: string;
  heroTitle?: string;
  heroDescription?: string;
  whyChooseSection?: { heading?: string; items?: WhyChooseItem[] };
  heroStats?: HeroStatItem[];
}

interface Props {
  isOpen: boolean;
  category: EditableCategory;
  onClose: () => void;
}

interface FormState {
  title: string;
  description: string;
  iconName: string;
  heroTitle: string;
  heroDescription: string;
  heroStats: HeroStatItem[]; // exactly 4
  whyChooseHeading: string;
  whyChooseItems: WhyChooseItem[]; // exactly 3
}

/** Build the initial form pre-filled with the EFFECTIVE live values: the saved
 *  DB value when present, otherwise the exact default the public page renders.
 *  The form mirrors the live page as real, editable values (not placeholders). */
function buildInitialState(c: EditableCategory): FormState {
  const stats: HeroStatItem[] = Array.from({ length: 4 }, (_, i) => ({
    label: c.heroStats?.[i]?.label || DEFAULT_HERO_STATS[i].label,
    iconName: c.heroStats?.[i]?.iconName || DEFAULT_HERO_STATS[i].iconName,
  }));
  const items: WhyChooseItem[] = Array.from({ length: 3 }, (_, i) => ({
    title: c.whyChooseSection?.items?.[i]?.title || DEFAULT_WHY_CHOOSE_SECTION.items[i].title,
    description: c.whyChooseSection?.items?.[i]?.description || DEFAULT_WHY_CHOOSE_SECTION.items[i].description,
    iconName: c.whyChooseSection?.items?.[i]?.iconName || DEFAULT_WHY_CHOOSE_SECTION.items[i].iconName,
  }));
  return {
    title: c.title ?? '',
    description: c.description ?? '',
    iconName: c.iconName || 'FileText',
    heroTitle: c.heroTitle || c.title || '',
    heroDescription: c.heroDescription || c.description || '',
    heroStats: stats,
    whyChooseHeading: c.whyChooseSection?.heading || DEFAULT_WHY_CHOOSE_SECTION.heading,
    whyChooseItems: items,
  };
}

const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <section className="border-t border-gray-700 pt-5 mt-5 first:border-0 first:pt-0 first:mt-0">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {desc && <p className="text-sm text-gray-400 mb-3">{desc}</p>}
    <div className={desc ? '' : 'mt-3'}>{children}</div>
  </section>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-300 mb-1">{children}</label>
);

export default function EditCategoryDetailsModal({ isOpen, category, onClose }: Props) {
  const initial = useMemo(() => buildInitialState(category), [category]);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const inputClass = (key: string) =>
    `w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${
      errors[key] ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-primary'
    }`;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateStat = (i: number, patch: Partial<HeroStatItem>) =>
    setForm((f) => ({ ...f, heroStats: f.heroStats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));

  const updateItem = (i: number, patch: Partial<WhyChooseItem>) =>
    setForm((f) => ({ ...f, whyChooseItems: f.whyChooseItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.iconName.trim()) e.iconName = 'Icon is required';
    if (!form.heroTitle.trim()) e.heroTitle = 'Hero title is required';
    if (!form.heroDescription.trim()) e.heroDescription = 'Hero description is required';
    if (!form.whyChooseHeading.trim()) e.whyChooseHeading = 'Heading is required';
    form.heroStats.forEach((s, i) => {
      if (!s.label.trim()) e[`stat-${i}-label`] = 'Required';
      if (!s.iconName.trim()) e[`stat-${i}-icon`] = 'Required';
    });
    form.whyChooseItems.forEach((it, i) => {
      if (!it.title.trim()) e[`why-${i}-title`] = 'Required';
      if (!it.description.trim()) e[`why-${i}-desc`] = 'Required';
      if (!it.iconName.trim()) e[`why-${i}-icon`] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      // Content-only payload. We deliberately never send id / slug / categoryType
      // so editing content can never change the category's URL or routing.
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        iconName: form.iconName,
        heroTitle: form.heroTitle.trim(),
        heroDescription: form.heroDescription.trim(),
        heroStats: form.heroStats.map((s) => ({ label: s.label.trim(), iconName: s.iconName })),
        whyChooseSection: {
          heading: form.whyChooseHeading.trim(),
          items: form.whyChooseItems.map((it) => ({
            title: it.title.trim(),
            description: it.description.trim(),
            iconName: it.iconName,
          })),
        },
      };
      const categoryId = category._id || category.id;
      await apiPut(`/services/categories/${categoryId}`, payload);
      toast.success('Category page details updated.');
      onClose();
    } catch (err: any) {
      console.error('Failed to update category details:', err);
      toast.error(err?.message || 'Failed to update. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Page Details</h2>
            <p className="text-sm text-gray-400">{category.title} — controls the public category page</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors" aria-label="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* General */}
          <Section title="General">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
              <div>
                <Label>Title</Label>
                <input
                  className={inputClass('title')}
                  value={form.title}
                  placeholder="Category title"
                  onChange={(e) => setField('title', e.target.value)}
                />
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>
              <div className="sm:w-44">
                <Label>Icon</Label>
                <IconPicker value={form.iconName} onChange={(v) => setField('iconName', v)} label="category icon" error={!!errors.iconName} />
              </div>
            </div>
            <div className="mt-4">
              <Label>Description</Label>
              <textarea
                className={inputClass('description')}
                rows={2}
                value={form.description}
                placeholder="Short description shown under the category"
                onChange={(e) => setField('description', e.target.value)}
              />
            </div>
          </Section>

          {/* Hero */}
          <Section title="Hero Section" desc="The large heading and intro at the top of the category page.">
            <Label>Hero Title</Label>
            <input
              className={inputClass('heroTitle')}
              value={form.heroTitle}
              placeholder={form.title || 'Hero title'}
              onChange={(e) => setField('heroTitle', e.target.value)}
            />
            {errors.heroTitle && <p className="text-xs text-red-400 mt-1">{errors.heroTitle}</p>}
            <div className="mt-3">
              <Label>Hero Description</Label>
              <textarea
                className={inputClass('heroDescription')}
                rows={2}
                value={form.heroDescription}
                placeholder="One or two lines describing this category"
                onChange={(e) => setField('heroDescription', e.target.value)}
              />
              {errors.heroDescription && <p className="text-xs text-red-400 mt-1">{errors.heroDescription}</p>}
            </div>
          </Section>

          {/* Hero stats */}
          <Section title="Stats (4)" desc="The four highlight numbers/badges shown in the hero.">
            <div className="space-y-3">
              {form.heroStats.map((stat, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] gap-3 items-start">
                  <div>
                    <input
                      className={inputClass(`stat-${i}-label`)}
                      value={stat.label}
                      placeholder={DEFAULT_HERO_STATS[i].label}
                      onChange={(e) => updateStat(i, { label: e.target.value })}
                    />
                    {errors[`stat-${i}-label`] && <p className="text-xs text-red-400 mt-1">{errors[`stat-${i}-label`]}</p>}
                  </div>
                  <div className="w-40">
                    <IconPicker value={stat.iconName} onChange={(v) => updateStat(i, { iconName: v })} label={`stat ${i + 1} icon`} error={!!errors[`stat-${i}-icon`]} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Why choose */}
          <Section title="Why Choose (3 cards)" desc="The three reasons shown lower on the page.">
            <Label>Section Heading</Label>
            <input
              className={inputClass('whyChooseHeading')}
              value={form.whyChooseHeading}
              placeholder={DEFAULT_WHY_CHOOSE_SECTION.heading}
              onChange={(e) => setField('whyChooseHeading', e.target.value)}
            />
            {errors.whyChooseHeading && <p className="text-xs text-red-400 mt-1">{errors.whyChooseHeading}</p>}

            <div className="space-y-4 mt-4">
              {form.whyChooseItems.map((it, i) => (
                <div key={i} className="rounded-lg border border-gray-700 p-3 bg-gray-900/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Card {i + 1}</span>
                    <div className="w-40">
                      <IconPicker value={it.iconName} onChange={(v) => updateItem(i, { iconName: v })} label={`card ${i + 1} icon`} error={!!errors[`why-${i}-icon`]} />
                    </div>
                  </div>
                  <input
                    className={`${inputClass(`why-${i}-title`)} mb-2`}
                    value={it.title}
                    placeholder={DEFAULT_WHY_CHOOSE_SECTION.items[i].title}
                    onChange={(e) => updateItem(i, { title: e.target.value })}
                  />
                  {errors[`why-${i}-title`] && <p className="text-xs text-red-400 -mt-1 mb-2">{errors[`why-${i}-title`]}</p>}
                  <textarea
                    className={inputClass(`why-${i}-desc`)}
                    rows={2}
                    value={it.description}
                    placeholder={DEFAULT_WHY_CHOOSE_SECTION.items[i].description}
                    onChange={(e) => updateItem(i, { description: e.target.value })}
                  />
                  {errors[`why-${i}-desc`] && <p className="text-xs text-red-400 mt-1">{errors[`why-${i}-desc`]}</p>}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-colors" disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
