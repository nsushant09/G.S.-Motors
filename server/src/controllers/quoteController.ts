import { Request, Response } from 'express';
import { QuoteRequest } from '../models/QuoteRequest';
import { quoteBodySchema } from '../schemas/quote';
import { verifyMagicBytes } from '../middleware/upload';
import { storeImage } from '../utils/storage';
import { AppError } from '../utils/errors';

type ReqWithRef = Request & { refCode?: string };

export async function createQuote(req: ReqWithRef, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (files.length === 0) {
    throw new AppError(400, 'VALIDATION_FAILED', 'At least one photo is required', {
      images: 'Add at least one photo',
    });
  }

  const badFile = verifyMagicBytes(files);
  if (badFile) {
    throw new AppError(400, 'VALIDATION_FAILED', `"${badFile}" is not a valid image file`, {
      images: 'Only JPEG, PNG or WEBP images are allowed',
    });
  }

  const body = quoteBodySchema.parse(req.body);
  const refCode = req.refCode as string;

  const images = await Promise.all(files.map((f) => storeImage(f.buffer, f.mimetype, refCode)));

  const quote = await QuoteRequest.create({
    refCode,
    owner: { name: body.name, phone: body.phone, email: body.email, city: body.city },
    vehicle: {
      make: body.make,
      model: body.model,
      year: body.year,
      kmDriven: body.kmDriven,
      fuel: body.fuel,
      transmission: body.transmission,
      ownership: body.ownership,
      condition: body.condition,
      expectedPriceNPR: body.expectedPriceNPR,
      notes: body.notes,
    },
    images,
    status: 'new',
  });

  res.status(201).json({ data: { refCode: quote.refCode, status: quote.status } });
}

export async function getQuoteStatus(req: Request, res: Response) {
  const quote = await QuoteRequest.findOne({ refCode: req.params.refCode });
  if (!quote) throw new AppError(404, 'NOT_FOUND', 'No quote request found with that reference code');
  res.json({ data: { refCode: quote.refCode, status: quote.status, createdAt: quote.createdAt } });
}
