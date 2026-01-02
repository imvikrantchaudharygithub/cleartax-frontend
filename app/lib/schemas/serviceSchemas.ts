import * as yup from 'yup';

export const inquiryFormSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  email: yup
    .string()
    .transform((value) => (value === '' ? undefined : value))
    .notRequired()
    .test('email', 'Invalid email address', function(value) {
      if (!value || value.length === 0) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  businessType: yup
    .string()
    .required('Please select a business type')
    .oneOf(
      ['individual', 'proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited', 'other'],
      'Please select a valid business type'
    ),
  message: yup
    .string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long'),
  serviceId: yup.string().optional(),
});

export type InquiryFormData = yup.InferType<typeof inquiryFormSchema>;
