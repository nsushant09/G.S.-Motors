import { Router, Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createQuote, getQuoteStatus } from '../controllers/quoteController';
import { uploadQuoteImages } from '../middleware/upload';
import { quoteRateLimit } from '../middleware/rateLimit';
import { generateRefCode } from '../utils/refCode';

type ReqWithRef = Request & { refCode?: string };

const router = Router();

router.post(
  '/',
  quoteRateLimit,
  (req: ReqWithRef, _res: Response, next: NextFunction) => {
    req.refCode = generateRefCode();
    next();
  },
  uploadQuoteImages,
  asyncHandler(createQuote)
);

router.get('/:refCode', asyncHandler(getQuoteStatus));

export default router;
