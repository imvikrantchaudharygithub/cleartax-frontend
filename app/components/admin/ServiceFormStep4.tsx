'use client';

import { FieldArray, Field, ErrorMessage, useFormikContext } from 'formik';
import { Plus, X } from 'lucide-react';

export default function ServiceFormStep4() {
  const { values, errors, touched } = useFormikContext<any>();

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
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  Add Requirement
                </button>
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
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <ErrorMessage name={`process.${index}.title`} component="p" className="mt-1 text-sm text-red-400" />
                        </div>
                        <div>
                          <Field
                            as="textarea"
                            name={`process.${index}.description`}
                            rows={2}
                            placeholder="Step description"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <ErrorMessage name={`process.${index}.description`} component="p" className="mt-1 text-sm text-red-400" />
                        </div>
                        <div>
                          <Field
                            type="text"
                            name={`process.${index}.duration`}
                            placeholder="Duration (e.g., 1 day)"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
    </div>
  );
}

