import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAdmin } from '../middleware/requireAdmin';
import { uploadCarImages } from '../middleware/upload';
import { listAdminCars, getCarById, createCar, updateCar, deleteCar } from '../controllers/adminCarController';
import { listQuotes, updateQuoteStatus } from '../controllers/adminQuoteController';
import { uploadCarPhotos } from '../controllers/adminUploadController';

const router = Router();
router.use(requireAdmin);

router.get('/cars', asyncHandler(listAdminCars));
router.get('/cars/:id', asyncHandler(getCarById));
router.post('/cars', asyncHandler(createCar));
router.put('/cars/:id', asyncHandler(updateCar));
router.delete('/cars/:id', asyncHandler(deleteCar));

router.get('/quotes', asyncHandler(listQuotes));
router.patch('/quotes/:refCode/status', asyncHandler(updateQuoteStatus));

router.post('/uploads', uploadCarImages, asyncHandler(uploadCarPhotos));

export default router;
