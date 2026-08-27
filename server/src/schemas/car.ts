import { z } from 'zod';

export const carsQuerySchema = z.object({
  make: z.string().trim().min(1).optional(),
  bodyType: z.string().trim().min(1).optional(),
  fuel: z.string().trim().min(1).optional(),
  transmission: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  maxKm: z.coerce.number().nonnegative().optional(),
  q: z.string().trim().min(1).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'km_asc']).default('newest'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(48).default(12),
});

export type CarsQuery = z.infer<typeof carsQuerySchema>;
