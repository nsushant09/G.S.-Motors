import { Request, Response } from 'express';
import { QuoteRequest } from '../models/QuoteRequest';
import { quoteStatusSchema } from '../schemas/admin';
import { AppError } from '../utils/errors';

export async function listQuotes(req: Request, res: Response) {
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const filter = status ? { status } : {};
  const data = await QuoteRequest.find(filter).sort({ createdAt: -1 });
  res.json({ data });
}

export async function updateQuoteStatus(req: Request, res: Response) {
  const { status } = quoteStatusSchema.parse(req.body);
  const quote = await QuoteRequest.findOneAndUpdate({ refCode: req.params.refCode }, { status }, { new: true });
  if (!quote) throw new AppError(404, 'NOT_FOUND', 'Quote not found');
  res.json({ data: quote });
}
