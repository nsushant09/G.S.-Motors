import rateLimit from 'express-rate-limit';

export const quoteRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many quote requests from this address. Try again in an hour.',
    },
  },
});
