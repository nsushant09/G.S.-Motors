import { Request, Response } from 'express';
import { Car } from '../models/Car';
import { carAdminSchema } from '../schemas/admin';
import { AppError } from '../utils/errors';
import { slugify } from '../utils/slugify';

async function generateUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Car.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function listAdminCars(_req: Request, res: Response) {
  const data = await Car.find().sort({ createdAt: -1 });
  res.json({ data });
}

export async function getCarById(req: Request, res: Response) {
  const car = await Car.findById(req.params.id);
  if (!car) throw new AppError(404, 'NOT_FOUND', 'Car not found');
  res.json({ data: car });
}

export async function createCar(req: Request, res: Response) {
  const body = carAdminSchema.parse(req.body);
  const baseSlug = slugify([body.year, body.make, body.model, body.variant]);
  const slug = await generateUniqueSlug(baseSlug);
  const car = await Car.create({ ...body, slug });
  res.status(201).json({ data: car });
}

export async function updateCar(req: Request, res: Response) {
  const body = carAdminSchema.parse(req.body);
  const existing = await Car.findById(req.params.id);
  if (!existing) throw new AppError(404, 'NOT_FOUND', 'Car not found');

  const baseSlug = slugify([body.year, body.make, body.model, body.variant]);
  const slug = await generateUniqueSlug(baseSlug, String(existing._id));

  Object.assign(existing, body, { slug });
  await existing.save();
  res.json({ data: existing });
}

export async function deleteCar(req: Request, res: Response) {
  const deleted = await Car.findByIdAndDelete(req.params.id);
  if (!deleted) throw new AppError(404, 'NOT_FOUND', 'Car not found');
  res.status(204).send();
}
