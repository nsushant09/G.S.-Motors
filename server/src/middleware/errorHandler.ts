import { ErrorRequestHandler } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.fields ? { fields: err.fields } : {}) },
    });
    return;
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) fields[issue.path.join('.')] = issue.message;
    res.status(400).json({ error: { code: 'VALIDATION_FAILED', message: 'Validation failed', fields } });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Each photo must be under the size limit'
        : err.code === 'LIMIT_FILE_COUNT'
          ? 'You can upload at most 6 photos'
          : 'Photo upload failed';
    res.status(400).json({ error: { code: 'VALIDATION_FAILED', message, fields: { images: message } } });
    return;
  }

  if (err instanceof Error && err.message === 'UNSUPPORTED_FILE_TYPE') {
    res.status(400).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Only JPEG, PNG or WEBP images are allowed',
        fields: { images: 'Unsupported file type' },
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
