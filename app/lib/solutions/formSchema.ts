import { z } from 'zod';
import { FV_COLOR_KEYS } from '@/app/lib/fv/colors';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const solutionFormSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(60, 'Title cannot exceed 60 characters'),
  slug: z
    .string()
    .trim()
    .min(1, 'URL is required')
    .max(80, 'URL cannot exceed 80 characters')
    .regex(SLUG_PATTERN, 'Use lowercase words separated by hyphens'),
  iconName: z.string().trim().min(1, 'Pick an icon').max(50),
  color: z.enum(FV_COLOR_KEYS),
  subtitle: z.string().trim().max(120, 'Subtitle cannot exceed 120 characters'),
  pageHeading: z.string().trim().max(120, 'Page heading cannot exceed 120 characters'),
  pageDescription: z.string().trim().max(300, 'Page description cannot exceed 300 characters'),
  showOnHome: z.boolean(),
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(2, 'Section title must be at least 2 characters').max(80, 'Section title cannot exceed 80 characters'),
        items: z
          .array(z.object({ service: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid service'), popular: z.boolean() }))
          .max(40, 'A section can hold at most 40 services'),
      }),
    )
    .max(10, 'A solution can have at most 10 sections'),
});

export type SolutionFormSchemaValues = z.infer<typeof solutionFormSchema>;
