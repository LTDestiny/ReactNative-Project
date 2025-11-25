import { Router } from 'express';
import { getCategories, getBrands } from '../controllers/misc.controller';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/categories', getCategories);

/**
 * @route   GET /api/brands
 * @desc    Get all brands
 * @access  Public
 */
router.get('/brands', getBrands);

export default router;
