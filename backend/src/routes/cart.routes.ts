import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cart.controller';

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// POST /api/cart/items - Add item to cart
router.post('/items', addToCart);

// PUT /api/cart/items/:item_id - Update cart item quantity
router.put('/items/:item_id', updateCartItem);

// DELETE /api/cart/items/:item_id - Remove item from cart
router.delete('/items/:item_id', removeCartItem);

// DELETE /api/cart - Clear entire cart
router.delete('/', clearCart);

export default router;
