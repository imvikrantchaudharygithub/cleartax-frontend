'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, useFieldArray, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, Loader2, Plus, Save, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import IconPicker from '@/app/components/admin/IconPicker';
import ColorSwatches from './ColorSwatches';
import SectionEditor from './SectionEditor';
import SolutionPreview from './SolutionPreview';
import { solutionFormSchema, type SolutionFormSchemaValues } from '@/app/lib/solutions/formSchema';
import { mapServerErrors, slugify, toFormValues, toPayload } from '@/app/lib/solutions/form';
import { solutionService } from '@/app/lib/api/services/solution.service';
import { useServiceIndex } from '@/app/lib/admin/useServiceIndex';
import { useUnsavedChangesGuard } from '@/app/lib/admin/useUnsavedChangesGuard';
import type { SolutionAdminDetail } from '@/app/lib/api/types';

const INPUT =
  'w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-white placeholder-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';
const LABEL = 'mb-1.5 block text-sm font-medium text-gray-300';
const PANEL = 'rounded-xl border border-gray-700 bg-gray-800 p-5';

function FieldError({ id, message }: { id?: string; message?: string }) {
  return message ? (
    <p id={id} className="mt-1 text-sm text-red-400">
      {message}
    </p>
  ) : null;
}

export default function SolutionForm({ initial }: { initial?: SolutionAdminDetail }) {
  const router = useRouter();
  const isEdit = !!initial;
  const wasPublished = initial?.status === 'published';
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState<null | 'draft' | 'published'>(null);
  const serviceIndex = useServiceIndex();

  const methods = useForm<SolutionFormSchemaValues>({
    resolver: zodResolver(solutionFormSchema),
    defaultValues: toFormValues(initial),
    mode: 'onTouched',
  });
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty },
  } = methods;
  const sections = useFieldArray({ control, name: 'sections' });
  const values = useWatch({ control });
  // Stays on while saving: a 401 makes the axios interceptor hard-redirect to /admin/login, and the
  // edits must survive that (beforeunload prompt). A successful save resets the form and soft-navigates
  // with router.push, which neither guard intercepts.
  useUnsavedChangesGuard(isDirty);

  const selectedIds = useMemo(
    () => new Set((values.sections ?? []).flatMap((s) => (s?.items ?? []).map((i) => i?.service).filter((id): id is string => !!id))),
    [values.sections],
  );
  const slugChanged = isEdit && wasPublished && (values.slug ?? '') !== initial!.slug;

  const submit = (status: 'draft' | 'published') =>
    handleSubmit(
      async (formValues) => {
        if (status === 'published' && formValues.sections.every((s) => s.items.length === 0)) {
          setError('sections', { type: 'manual', message: 'Add at least one service before publishing' });
          toast.error('Add at least one service before publishing');
          return;
        }
        setSaving(status);
        try {
          const payload = toPayload(formValues, status);
          if (isEdit) await solutionService.update(initial!._id, payload);
          else await solutionService.create(payload);
          toast.success(status === 'published' ? (wasPublished ? 'Solution updated' : 'Solution published') : 'Draft saved');
          reset(formValues);
          router.push('/admin/solutions');
        } catch (err: any) {
          // 400 `errors[].field` (body.sections.0.title …) and 409 `{ field: 'slug' }` both land inline.
          const fieldErrors = Object.entries(mapServerErrors(err?.errors));
          fieldErrors.forEach(([field, message], i) =>
            setError(field as FieldPath<SolutionFormSchemaValues>, { type: 'server', message }, { shouldFocus: i === 0 }),
          );
          toast.error(fieldErrors.length > 0 ? 'Please fix the highlighted fields' : err?.message || 'Could not save the solution');
        } finally {
          setSaving(null);
        }
      },
      () => toast.error('Please fix the highlighted fields'),
    );

  const titleField = register('title', {
    onChange: (event) => {
      if (!slugTouched) setValue('slug', slugify(event.target.value), { shouldDirty: true });
    },
  });
  // The publish-time "no services" error is set by hand, so hide it once a service is added.
  const sectionsError =
    errors.sections?.type === 'manual' && selectedIds.size > 0 ? undefined : (errors.sections?.message ?? errors.sections?.root?.message);

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href="/admin/solutions" prefetch={false} className="mb-2 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              All solutions
            </Link>
            <h1 className="break-words text-3xl font-bold text-white">{isEdit ? `Edit “${initial!.title}”` : 'Add Solution'}</h1>
            <p className="mt-1 text-gray-400">Shows as an icon on the home banner and as its own page.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submit('draft')}
              disabled={saving !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 font-semibold text-white hover:bg-gray-600 disabled:opacity-50"
            >
              {saving === 'draft' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {wasPublished ? 'Unpublish & save draft' : 'Save draft'}
            </button>
            <button
              type="button"
              onClick={submit('published')}
              disabled={saving !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {saving === 'published' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {wasPublished ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-6">
            <section className={PANEL} aria-labelledby="solution-card-panel">
              <h2 id="solution-card-panel" className="mb-4 text-lg font-semibold text-white">Card</h2>
              <div className="grid gap-4 md:grid-cols-[1fr_240px]">
                <div>
                  <label htmlFor="solution-title" className={LABEL}>Title</label>
                  <input
                    id="solution-title"
                    {...titleField}
                    aria-invalid={errors.title ? true : undefined}
                    aria-describedby={errors.title ? 'solution-title-error' : undefined}
                    placeholder="Start a Business"
                    className={INPUT}
                  />
                  <FieldError id="solution-title-error" message={errors.title?.message} />
                </div>
                <div>
                  <span className={LABEL}>Icon</span>
                  <Controller
                    control={control}
                    name="iconName"
                    render={({ field }) => (
                      <IconPicker value={field.value} onChange={field.onChange} label="solution icon" error={!!errors.iconName} />
                    )}
                  />
                  <FieldError message={errors.iconName?.message} />
                </div>
              </div>
              <div className="mt-4">
                <span id="solution-colour-label" className={LABEL}>Colour</span>
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => <ColorSwatches value={field.value} onChange={field.onChange} labelledBy="solution-colour-label" />}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="solution-subtitle" className={LABEL}>
                  Card subtitle <span className="text-gray-500">(optional)</span>
                </label>
                <input id="solution-subtitle" {...register('subtitle')} placeholder="Company, LLP, Proprietorship & more" className={INPUT} />
                <FieldError message={errors.subtitle?.message} />
              </div>
              <label className="mt-4 flex items-center gap-3 text-sm text-gray-300">
                <input type="checkbox" {...register('showOnHome')} className="h-4 w-4 rounded border-gray-600 bg-gray-900" />
                Show on the home page
              </label>
            </section>

            <section className={PANEL} aria-labelledby="solution-page-panel">
              <h2 id="solution-page-panel" className="mb-4 text-lg font-semibold text-white">Page</h2>
              <label htmlFor="solution-slug" className={LABEL}>Page URL</label>
              <div
                className={clsx(
                  'flex items-stretch overflow-hidden rounded-lg border bg-gray-900 focus-within:ring-2 focus-within:ring-blue-500',
                  errors.slug ? 'border-red-500' : 'border-gray-700',
                )}
              >
                <span className="flex flex-none items-center border-r border-gray-700 px-3 text-sm text-gray-500">finvidhi.com/solutions/</span>
                <input
                  id="solution-slug"
                  {...register('slug', { onChange: () => setSlugTouched(true) })}
                  aria-invalid={errors.slug ? true : undefined}
                  aria-describedby={errors.slug ? 'solution-slug-error' : undefined}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-white outline-none"
                />
              </div>
              <FieldError id="solution-slug-error" message={errors.slug?.message} />
              {slugChanged && (
                <p className="mt-2 flex items-center gap-2 text-sm text-amber-300">
                  <AlertTriangle className="h-4 w-4 flex-none" />
                  This solution is live. Changing the URL breaks existing links to /solutions/{initial!.slug}.
                </p>
              )}
              <div className="mt-4">
                <label htmlFor="solution-heading" className={LABEL}>
                  Page heading <span className="text-gray-500">(optional, defaults to the title)</span>
                </label>
                <input id="solution-heading" {...register('pageHeading')} placeholder={values.title || 'Start Your Business The Right Way'} className={INPUT} />
                <FieldError message={errors.pageHeading?.message} />
              </div>
              <div className="mt-4">
                <label htmlFor="solution-description" className={LABEL}>Page description</label>
                <textarea id="solution-description" rows={3} {...register('pageDescription')} placeholder="From idea to incorporation, we make it simple." className={INPUT} />
                <div className="flex justify-between">
                  <FieldError message={errors.pageDescription?.message} />
                  <p className="ml-auto mt-1 text-xs text-gray-500">{(values.pageDescription ?? '').length}/300</p>
                </div>
              </div>
            </section>

            <section className={PANEL} aria-labelledby="solution-services-panel">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="solution-services-panel" className="text-lg font-semibold text-white">Services</h2>
                <p className="text-sm text-gray-400">
                  {selectedIds.size} selected in {sections.fields.length} section{sections.fields.length === 1 ? '' : 's'} · ★ = Most popular
                </p>
              </div>
              {serviceIndex.error && (
                <p className="mb-3 text-sm text-red-400">
                  Could not load the service list ({serviceIndex.error}).{' '}
                  <button type="button" onClick={() => serviceIndex.refresh()} className="font-semibold underline">
                    Retry
                  </button>
                </p>
              )}
              <FieldError message={sectionsError} />
              <div className="space-y-4">
                {sections.fields.map((field, index) => (
                  <SectionEditor
                    key={field.id}
                    index={index}
                    count={sections.fields.length}
                    rows={serviceIndex.rows}
                    loadingRows={serviceIndex.loading}
                    indexReady={!serviceIndex.loading && !serviceIndex.error}
                    selectedIds={selectedIds}
                    itemsMeta={initial?.itemsMeta ?? {}}
                    onMove={(to) => sections.move(index, to)}
                    onRemove={() => sections.remove(index)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => sections.append({ title: '', items: [] })}
                disabled={sections.fields.length >= 10}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 py-3 text-sm font-semibold text-gray-300 hover:border-blue-400 hover:text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Add section
              </button>
            </section>
          </div>

          <SolutionPreview
            title={values.title ?? ''}
            subtitle={values.subtitle ?? ''}
            iconName={values.iconName ?? ''}
            color={values.color ?? 'blue'}
            heading={values.pageHeading || values.title || ''}
            description={values.pageDescription ?? ''}
            serviceCount={selectedIds.size}
          />
        </div>
      </form>
    </FormProvider>
  );
}
