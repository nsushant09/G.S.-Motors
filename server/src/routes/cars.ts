import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { listCars, getCarBySlug, getFeaturedCars, getMakes } from '../controllers/carController';

const router = Router();

router.get('/featured', asyncHandler(getFeaturedCars));
router.get('/makes', asyncHandler(getMakes));
router.get('/', asyncHandler(listCars));
router.get('/:slug', asyncHandler(getCarBySlug));

export default router;
