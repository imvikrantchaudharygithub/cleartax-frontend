'use client';

import { FieldArray, Field, useFormikContext, getIn } from 'formik';
import { Plus, X } from 'lucide-react';

export default function ServiceFormStep5() {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateField } = useFormikContext<any>();

  const handleFieldChange = (name: string, value: string) => {
    setFieldValue(name, value);
    setFieldTouched(name, true, false);
    void validateField(name);
  };

  const getFieldClassName = (name: string, inputStyle: 'light' | 'dark' = 'dark') => {
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
        <label className="block text-sm font-medium text-gray-300 mb-2">FAQs</label>
        <FieldArray name="faqs">
          {({ push, remove }) => (
            <div className="space-y-4">
              {values.faqs && values.faqs.length > 0 ? (
                values.faqs.map((faq: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">FAQ {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-red-400 hover:text-red-300 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <Field
                        type="text"
                        name={`faqs.${index}.question`}
                        placeholder="Question"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleFieldChange(`faqs.${index}.question`, e.target.value)
                        }
                        className={getFieldClassName(`faqs.${index}.question`, 'dark')}
                      />
                      <Field
                        as="textarea"
                        name={`faqs.${index}.answer`}
                        rows={3}
                        placeholder="Answer"
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleFieldChange(`faqs.${index}.answer`, e.target.value)
                        }
                        className={getFieldClassName(`faqs.${index}.answer`, 'dark')}
                      />
                    </div>
                  </div>
                ))
              ) : null}
              <button
                type="button"
                onClick={() => push({ id: `faq-${Date.now()}`, question: '', answer: '' })}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add FAQ
              </button>
            </div>
          )}
        </FieldArray>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Related Services (optional)</label>
        <FieldArray name="relatedServices">
          {({ push, remove }) => (
            <div className="space-y-2">
              {values.relatedServices && values.relatedServices.length > 0 ? (
                values.relatedServices.map((serviceId: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Field
                      type="text"
                      name={`relatedServices.${index}`}
                      placeholder="Related service ID (optional)"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFieldChange(`relatedServices.${index}`, e.target.value)
                      }
                      className={getFieldClassName(`relatedServices.${index}`, 'light')}
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
              <button
                type="button"
                onClick={() => push('')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Related Service
              </button>
            </div>
          )}
        </FieldArray>
        <p className="mt-2 text-xs text-gray-500">Enter service IDs separated by commas or add one per line</p>
      </div>
    </div>
  );
}

