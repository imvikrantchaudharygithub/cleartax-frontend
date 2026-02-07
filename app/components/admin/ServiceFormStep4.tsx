'use client';

import { useState, useMemo } from 'react';
import { FieldArray, Field, ErrorMessage, useFormikContext, getIn } from 'formik';
import { Plus, X, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AvailableServiceForImport } from './AddServiceModal';

type ServiceFormStep4Props = {
  availableServices?: AvailableServiceForImport[];
};

export default function ServiceFormStep4({ availableServices = [] }: ServiceFormStep4Props) {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateField } = useFormikContext<any>();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSearch, setImportSearch] = useState('');

  const filteredImportServices = useMemo(() => {
    if (!importSearch.trim()) return availableServices;
    const q = importSearch.toLowerCase().trim();
    return availableServices.filter(
      (s) => s.title.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q)
    );
  }, [availableServices, importSearch]);

  const handleImportFromService = (service: AvailableServiceForImport) => {
    const current = Array.isArray(values.requirements)
      ? values.requirements.map((r: unknown) => (typeof r === 'string' ? r : String(r ?? '')))
      : [];
    const existingSet = new Set(current.map((s: string) => s.trim().toLowerCase()));
    const toAdd = (service.requirements || [])
      .map((r) => (typeof r === 'string' ? r : String(r ?? '')).trim())
      .filter((s: string) => s.length > 0 && !existingSet.has(s.toLowerCase()));
    if (toAdd.length === 0) {
      toast('No new requirements to add (all already present or empty)');
      setIsImportModalOpen(false);
      return;
    }
    setFieldValue('requirements', [...current, ...toAdd]);
    setFieldTouched('requirements', true, false);
    toast.success(`Imported ${toAdd.length} requirement${toAdd.length === 1 ? '' : 's'}`);
    setIsImportModalOpen(false);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFieldValue(name, value);
    setFieldTouched(name, true, false);
    void validateField(name);
  };

  const getFieldClassName = (name: string, inputStyle: 'light' | 'dark' = 'light') => {
    const hasError = Boolean(getIn(errors, name));
    const isTouched = Boolean(getIn(touched, name));
    const baseClass =
      inputStyle === 'dark'
        ? 'w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent'
        : 'flex-1 px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent';
    const stateClass = hasError && isTouched
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-700 focus:ring-primary';
    return `${baseClass} ${stateClass}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Requirements</label>
        <FieldArray name="requirements">
          {({ push, remove }) => {
            // Ensure requirements array contains only strings
            const safeRequirements = Array.isArray(values.requirements)
              ? values.requirements.map((item: any) => typeof item === 'string' ? item : String(item || ''))
              : [];

            return (
              <div className="space-y-2">
                {safeRequirements.length > 0 ? (
                  safeRequirements.map((item: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Field
                        type="text"
                        name={`requirements.${index}`}
                        placeholder="Enter requirement"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange(`requirements.${index}`, e.target.value)
                        }
                        className={getFieldClassName(`requirements.${index}`)}
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                ) : null}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => push('')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Requirement
                  </button>
                  {availableServices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FileDown className="w-4 h-4" />
                      Import Requirement
                    </button>
                  )}
                </div>
              </div>
            );
          }}
        </FieldArray>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Process Steps *</label>
        <FieldArray name="process">
          {({ push, remove }) => {
            // Ensure process array contains only objects with proper structure
            const safeProcess = Array.isArray(values.process)
              ? values.process.map((step: any, idx: number) => {
                  if (typeof step === 'object' && step !== null) {
                    return {
                      step: typeof step.step === 'number' ? step.step : (idx + 1),
                      title: typeof step.title === 'string' ? step.title : '',
                      description: typeof step.description === 'string' ? step.description : '',
                      duration: typeof step.duration === 'string' ? step.duration : '',
                    };
                  }
                  return { step: idx + 1, title: '', description: '', duration: '' };
                })
              : [];

            return (
              <div className="space-y-4">
                {safeProcess.length > 0 ? (
                  safeProcess.map((step: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-300">Step {index + 1}</span>
                        {safeProcess.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Field
                            type="text"
                            name={`process.${index}.title`}
                            placeholder="Step title"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange(`process.${index}.title`, e.target.value)
                            }
                            className={getFieldClassName(`process.${index}.title`, 'dark')}
                          />
                          <ErrorMessage name={`process.${index}.title`} component="p" className="mt-1 text-sm text-red-400" />
                        </div>
                        <div>
                          <Field
                            as="textarea"
                            name={`process.${index}.description`}
                            rows={2}
                            placeholder="Step description"
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                              handleFieldChange(`process.${index}.description`, e.target.value)
                            }
                            className={getFieldClassName(`process.${index}.description`, 'dark')}
                          />
                          <ErrorMessage name={`process.${index}.description`} component="p" className="mt-1 text-sm text-red-400" />
                        </div>
                        <div>
                          <Field
                            type="text"
                            name={`process.${index}.duration`}
                            placeholder="Duration (e.g., 1 day)"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handleFieldChange(`process.${index}.duration`, e.target.value)
                            }
                            className={getFieldClassName(`process.${index}.duration`, 'dark')}
                          />
                          <ErrorMessage name={`process.${index}.duration`} component="p" className="mt-1 text-sm text-red-400" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No process steps added yet</p>
                )}
                <button
                  type="button"
                  onClick={() => push({ step: (safeProcess.length || 0) + 1, title: '', description: '', duration: '' })}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Process Step
                </button>
              </div>
            );
          }}
        </FieldArray>
        {errors.process && touched.process && typeof errors.process === 'string' && (
          <p className="mt-1 text-sm text-red-400">{errors.process}</p>
        )}
      </div>

      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Import from service</h3>
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportSearch('');
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search by title..."
                value={importSearch}
                onChange={(e) => setImportSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-1">
              {filteredImportServices.length === 0 ? (
                <p className="text-sm text-gray-500">No services to import from.</p>
              ) : (
                filteredImportServices.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleImportFromService(svc)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-600 transition-colors"
                  >
                    {svc.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

