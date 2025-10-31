import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createOrder,
  getMyOrders,
  getOrderDetail,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orders.controller';

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// POST /api/orders - Create order from cart
router.post('/', createOrder);

// GET /api/orders - Get user's orders
router.get('/', getMyOrders);

// GET /api/orders/:order_id - Get order detail
router.get('/:order_id', getOrderDetail);

// PUT /api/orders/:order_id - Update order status
router.put('/:order_id', updateOrderStatus);

// POST /api/orders/:order_id/cancel - Cancel order
router.post('/:order_id/cancel', cancelOrder);

export default router;
