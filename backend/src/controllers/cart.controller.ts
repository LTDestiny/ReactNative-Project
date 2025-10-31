import { Request, Response } from 'express';
import { db } from '../database';

// Get user's cart with items
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Get or create cart for user
    let cart = await db.query(
      `SELECT * FROM carts WHERE user_id = $1`,
      [userId]
    );

    if (cart.rows.length === 0) {
      // Create cart if doesn't exist
      const newCart = await db.query(
        `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`,
        [userId]
      );
      cart = newCart;
    }

    const cartId = cart.rows[0].id;

    // Get cart items with product details
    const items = await db.query(
      `SELECT 
        ci.id,
        ci.quantity,
        ci.added_at,
        p.id as product_id,
        p.name as product_name,
        p.price,
        p.sale_price,
        p.sku,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image_url,
        COALESCE(i.quantity, 0) as stock,
        b.name as brand_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ci.cart_id = $1
      ORDER BY ci.added_at DESC`,
      [cartId]
    );

    // Calculate totals
    const subtotal = items.rows.reduce((sum, item) => {
      const price = item.sale_price || item.price;
      return sum + (parseFloat(price) * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        cart_id: cartId,
        items: items.rows,
        subtotal: subtotal.toFixed(2),
        item_count: items.rows.length,
      },
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart',
    });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Check if product exists and has stock
    const product = await db.query(
      `SELECT p.*, COALESCE(i.quantity, 0) as stock
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = $1 AND p.is_active = true`,
      [product_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive',
      });
    }

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.rows[0].stock} items in stock`,
      });
    }

    // Get or create cart
    let cart = await db.query(
      `SELECT * FROM carts WHERE user_id = $1`,
      [userId]
    );

    if (cart.rows.length === 0) {
      cart = await db.query(
        `INSERT INTO carts (user_id) VALUES ($1) RETURNING *`,
        [userId]
      );
    }

    const cartId = cart.rows[0].id;

    // Check if item already in cart
    const existingItem = await db.query(
      `SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, product_id]
    );

    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;

      if (product.rows[0].stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.rows[0].stock} items in stock`,
        });
      }

      await db.query(
        `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item
      await db.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [cartId, product_id, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Item added to cart',
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { item_id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    // Verify item belongs to user's cart
    const item = await db.query(
      `SELECT ci.*, p.*, COALESCE(i.quantity, 0) as stock
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [item_id, userId]
    );

    if (item.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    if (item.rows[0].stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.rows[0].stock} items in stock`,
      });
    }

    await db.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
      [quantity, item_id]
    );

    res.json({
      success: true,
      message: 'Cart updated',
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
    });
  }
};

// Remove item from cart
export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { item_id } = req.params;

    // Verify item belongs to user's cart
    const item = await db.query(
      `SELECT ci.*
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1 AND c.user_id = $2`,
      [item_id, userId]
    );

    if (item.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    await db.query(`DELETE FROM cart_items WHERE id = $1`, [item_id]);

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove cart item',
    });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const cart = await db.query(
      `SELECT id FROM carts WHERE user_id = $1`,
      [userId]
    );

    if (cart.rows.length > 0) {
      await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [
        cart.rows[0].id,
      ]);
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
    });
  }
};
