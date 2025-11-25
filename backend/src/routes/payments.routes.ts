import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPayment,
  processPayment,
  getPaymentStatus,
  getOrderPayments,
  cancelPayment,
} from '../controllers/payments.controller';

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// POST /api/payments - Create payment for an order
router.post('/', createPayment);

// POST /api/payments/:payment_id/process - Process payment
router.post('/:payment_id/process', processPayment);

// GET /api/payments/:payment_id - Get payment status
router.get('/:payment_id', getPaymentStatus);

// GET /api/payments/order/:order_id - Get all payments for an order
router.get('/order/:order_id', getOrderPayments);

// POST /api/payments/:payment_id/cancel - Cancel payment
router.post('/:payment_id/cancel', cancelPayment);

export default router;

