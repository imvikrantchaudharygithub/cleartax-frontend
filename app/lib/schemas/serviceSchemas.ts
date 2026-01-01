import { z } from 'zod';

export const inquiryFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  businessType: z.enum([
    'individual',
    'proprietorship',
    'partnership',
    'llp',
    'private-limited',
    'public-limited',
    'other',
  ], {
    message: 'Please select a business type',
  }),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message is too long'),
  serviceId: z.string().optional(),
});

export type InquiryFormData = z.infer<typeof inquiryFormSchema>;
