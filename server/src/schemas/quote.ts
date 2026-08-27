import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const quoteBodySchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  phone: z.string().regex(/^9[678]\d{8}$/, 'Enter a valid Nepali mobile number'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email')
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : undefined)),
  city: z.string().trim().min(2, 'Enter your city'),
  make: z.string().trim().min(1, 'Enter the make'),
  model: z.string().trim().min(1, 'Enter the model'),
  year: z.coerce.number().int().min(1980).max(currentYear + 1),
  kmDriven: z.coerce.number().int().nonnegative(),
  fuel: z.enum(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']),
  transmission: z.enum(['Manual', 'Automatic']),
  ownership: z.coerce.number().int().positive(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Needs work']),
  expectedPriceNPR: z.coerce.number().nonnegative().optional(),
  notes: z.string().trim().max(500).optional(),
});

export type QuoteBody = z.infer<typeof quoteBodySchema>;
