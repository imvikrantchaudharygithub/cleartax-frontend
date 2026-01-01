'use client';

import { Field, ErrorMessage } from 'formik';

export default function ServiceFormStep2() {
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
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="e.g., 3-5 business days, Monthly, etc."
        />
        <ErrorMessage name="duration" component="p" className="mt-1 text-sm text-red-400" />
      </div>
    </div>
  );
}

