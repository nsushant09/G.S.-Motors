import { Request, Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Car, ICar } from '../models/Car';
import { carsQuerySchema } from '../schemas/car';
import { AppError } from '../utils/errors';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { priceNPR: 1 },
  price_desc: { priceNPR: -1 },
  km_asc: { kmDriven: 1 },
};

export async function listCars(req: Request, res: Response) {
  const query = carsQuerySchema.parse(req.query);
  const filter: FilterQuery<ICar> = {};

  if (query.make) filter.make = new RegExp(query.make, 'i');
  if (query.bodyType) filter.bodyType = query.bodyType;
  if (query.fuel) filter.fuel = query.fuel;
  if (query.transmission) filter.transmission = query.transmission;
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.priceNPR = {};
    if (query.minPrice !== undefined) filter.priceNPR.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.priceNPR.$lte = query.maxPrice;
  }
  if (query.maxKm !== undefined) filter.kmDriven = { $lte: query.maxKm };
  if (query.q) filter.$text = { $search: query.q };

  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Car.find(filter).sort(SORT_MAP[query.sort]).skip(skip).limit(limit),
    Car.countDocuments(filter),
  ]);

  res.json({ data, meta: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
}

export async function getCarBySlug(req: Request, res: Response) {
  const car = await Car.findOne({ slug: req.params.slug });
  if (!car) throw new AppError(404, 'NOT_FOUND', 'Car not found');
  res.json({ data: car });
}

export async function getMakes(_req: Request, res: Response) {
  const makes = await Car.distinct('make');
  res.json({ data: (makes as string[]).sort((a, b) => a.localeCompare(b)) });
}

export async function getFeaturedCars(_req: Request, res: Response) {
  const data = await Car.find({ featured: true, status: 'available' }).sort({ createdAt: -1 }).limit(6);
  res.json({ data });
}

export async function getGallery(_req: Request, res: Response) {
  const cars = await Car.find({ status: { $ne: 'sold' } }, { slug: 1, make: 1, model: 1, images: 1, bodyType: 1 });
  const data = cars.flatMap((car) =>
    car.images.map((src, i) => ({
      src,
      slug: car.slug,
      alt: `${car.make} ${car.model}${i > 0 ? ` — photo ${i + 1}` : ''}`,
      bodyType: car.bodyType,
    }))
  );
  res.json({ data });
}
