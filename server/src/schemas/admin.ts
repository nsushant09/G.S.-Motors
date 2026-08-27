import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});

const currentYear = new Date().getFullYear();

export const carAdminSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  variant: z.string().trim().optional(),
  year: z.coerce.number().int().min(1980, 'Enter a valid year').max(currentYear + 1, 'Enter a valid year'),
  priceNPR: z.coerce.number().int().nonnegative('Enter a valid price'),
  negotiable: z.boolean().optional().default(false),
  kmDriven: z.coerce.number().int().nonnegative('Enter kilometres driven'),
  fuel: z.string().trim().min(1, 'Fuel is required'),
  transmission: z.string().trim().min(1, 'Transmission is required'),
  bodyType: z.string().trim().min(1, 'Body type is required'),
  ownership: z.coerce.number().int().positive('Enter number of owners'),
  registrationProvince: z.string().trim().min(1, 'Registration province is required'),
  numberPlateZone: z.string().trim().optional(),
  color: z.string().trim().min(1, 'Colour is required'),
  seats: z.coerce.number().int().positive().optional(),
  engineCC: z.coerce.number().int().positive().optional(),
  description: z.string().trim().min(1, 'Description is required'),
  highlights: z.array(z.string().trim().min(1)).default([]),
  images: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(['available', 'reserved', 'sold']).default('available'),
  featured: z.boolean().optional().default(false),
});

export const quoteStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'quoted', 'closed']),
});
