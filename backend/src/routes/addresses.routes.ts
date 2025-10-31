import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addresses.controller';

const router = express.Router();

// All address routes require authentication
router.use(authenticate);

// GET /api/addresses - Get all addresses
router.get('/', getAddresses);

// GET /api/addresses/:address_id - Get single address
router.get('/:address_id', getAddress);

// POST /api/addresses - Create address
router.post('/', createAddress);

// PUT /api/addresses/:address_id - Update address
router.put('/:address_id', updateAddress);

// DELETE /api/addresses/:address_id - Delete address
router.delete('/:address_id', deleteAddress);

// POST /api/addresses/:address_id/default - Set as default
router.post('/:address_id/default', setDefaultAddress);

export default router;
