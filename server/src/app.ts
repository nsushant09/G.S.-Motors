import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db';
import healthRouter from './routes/health';
import carsRouter from './routes/cars';
import quotesRouter from './routes/quotes';
import galleryRouter from './routes/gallery';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());

// Ensures a DB connection exists before any route runs (cached across warm invocations).
app.use((_req: Request, _res: Response, next: NextFunction) => {
  connectDB().then(() => next(), next);
});

// Local-disk fallback for uploads when BLOB_READ_WRITE_TOKEN isn't set (see utils/storage.ts).
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/health', healthRouter);
app.use('/api/cars', carsRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

app.use(errorHandler);

export default app;
