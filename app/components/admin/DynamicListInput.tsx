'use client';

import { FieldArray, Field, useFormikContext, getIn } from 'formik';
import { Plus, X } from 'lucide-react';

interface DynamicListInputProps {
  name: string;
  label: string;
  placeholder?: string;
  addButtonText?: string;
  minItems?: number;
}

export default function DynamicListInput({
  name,
  label,
  placeholder = 'Enter item',
  addButtonText = 'Add Item',
  minItems = 0,
}: DynamicListInputProps) {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateField } = useFormikContext<any>();

  // Ensure the array exists and contains only strings
  const safeArray = Array.isArray(values[name]) 
    ? values[name].map((item: any) => typeof item === 'string' ? item : '')
    : [];

  const handleItemChange = (fieldPath: string, value: string) => {
    setFieldValue(fieldPath, value);
    setFieldTouched(fieldPath, true, false);
    void validateField(fieldPath);
  };

  const getFieldClassName = (fieldPath: string) => {
    const hasError = Boolean(getIn(errors, fieldPath));
    const isTouched = Boolean(getIn(touched, fieldPath));
    const baseClass =
      'flex-1 px-4 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent';
    const stateClass = hasError && isTouched
      ? 'border-red-500 focus:ring-red-500'
      : 'border-gray-700 focus:ring-primary';
    return `${baseClass} ${stateClass}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <FieldArray name={name}>
        {({ push, remove }) => (
          <div className="space-y-2">
            {safeArray.length > 0 ? (
              safeArray.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <Field
                      type="text"
                      name={`${name}.${index}`}
                      placeholder={placeholder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleItemChange(`${name}.${index}`, e.target.value)
                      }
                      className={getFieldClassName(`${name}.${index}`)}
                    />
                    {getIn(errors, `${name}.${index}`) && getIn(touched, `${name}.${index}`) && (
                      <p className="text-sm text-red-400">
                        {getIn(errors, `${name}.${index}`) as string}
                      </p>
                    )}
                  </div>
                  {safeArray.length > minItems && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No items added yet</p>
            )}
            <button
              type="button"
              onClick={() => push('')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {addButtonText}
            </button>
            {errors[name] && touched[name] && (
              <p className="text-sm text-red-400">{errors[name] as string}</p>
            )}
          </div>
        )}
      </FieldArray>
    </div>
  );
}

