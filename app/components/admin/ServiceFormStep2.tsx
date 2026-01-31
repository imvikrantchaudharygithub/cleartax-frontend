'use client';

import { Field, ErrorMessage, useFormikContext, getIn } from 'formik';

export default function ServiceFormStep2() {
  const { errors, touched, setFieldValue, setFieldTouched, validateField } = useFormikContext<any>();

  const handleFieldChange = (name: string, value: string | number) => {
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min Price (INR) *
          </label>
          <Field
            type="number"
            name="price.min"
            min="0"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('price.min', e.target.value)}
            className={getFieldClassName('price.min')}
            placeholder="0"
          />
          <ErrorMessage name="price.min" component="p" className="mt-1 text-sm text-red-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Price (INR) *
          </label>
          <Field
            type="number"
            name="price.max"
            min="0"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('price.max', e.target.value)}
            className={getFieldClassName('price.max')}
            placeholder="0"
          />
          <ErrorMessage name="price.max" component="p" className="mt-1 text-sm text-red-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Currency
        </label>
        <Field
          as="select"
          name="price.currency"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange('price.currency', e.target.value)}
          className={getFieldClassName('price.currency')}
        >
          <option value="INR">INR (Indian Rupee)</option>
          <option value="USD">USD (US Dollar)</option>
          <option value="EUR">EUR (Euro)</option>
        </Field>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Duration *
        </label>
        <Field
          name="duration"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('duration', e.target.value)}
          className={getFieldClassName('duration')}
          placeholder="e.g., 3-5 business days, Monthly, etc."
        />
        <ErrorMessage name="duration" component="p" className="mt-1 text-sm text-red-400" />
      </div>
    </div>
  );
}

