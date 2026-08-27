import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getGallery } from '../controllers/carController';

const router = Router();

router.get('/', asyncHandler(getGallery));

export default router;
