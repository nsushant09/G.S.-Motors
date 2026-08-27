import { Request, Response } from 'express';
import { verifyMagicBytes } from '../middleware/upload';
import { storeImage } from '../utils/storage';
import { AppError } from '../utils/errors';

export async function uploadCarPhotos(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new AppError(400, 'VALIDATION_FAILED', 'Select at least one photo');
  }

  const badFile = verifyMagicBytes(files);
  if (badFile) {
    throw new AppError(400, 'VALIDATION_FAILED', `"${badFile}" is not a valid image file`);
  }

  const urls = await Promise.all(files.map((f) => storeImage(f.buffer, f.mimetype, 'car', 'cars')));
  res.status(201).json({ data: { urls } });
}
