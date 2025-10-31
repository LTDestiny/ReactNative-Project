import { Request, Response } from 'express';
import { db } from '../database';

// Create order from cart
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { address_id, shipping_fee = 30000 } = req.body;

    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: 'Address is required',
      });
    }

    // Verify address belongs to user
    const address = await db.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [address_id, userId]
    );

    if (address.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    // Get cart items
    const cart = await db.query(
      `SELECT id FROM carts WHERE user_id = $1`,
      [userId]
    );

    if (cart.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const cartId = cart.rows[0].id;

    const cartItems = await db.query(
      `SELECT 
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.sale_price,
        COALESCE(i.quantity, 0) as stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE ci.cart_id = $1 AND p.is_active = true`,
      [cartId]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    // Check stock availability
    for (const item of cartItems.rows) {
      if (item.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Only ${item.stock} available.`,
        });
      }
    }

    // Calculate total
    const subtotal = cartItems.rows.reduce((sum, item) => {
      const price = item.sale_price || item.price;
      return sum + (parseFloat(price) * item.quantity);
    }, 0);

    const totalAmount = subtotal + parseFloat(shipping_fee.toString());

    // Begin transaction
    await db.query('BEGIN');

    try {
      // Create order
      const order = await db.query(
        `INSERT INTO orders (user_id, address_id, total_amount, shipping_fee, status, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, address_id, totalAmount, shipping_fee, 'pending', 'unpaid']
      );

      const orderId = order.rows[0].id;

      // Create order items and update inventory
      for (const item of cartItems.rows) {
        const price = item.sale_price || item.price;
        const totalPrice = parseFloat(price) * item.quantity;

        // Insert order item
        await db.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.product_id, item.name, item.quantity, price, totalPrice]
        );

        // Update inventory
        await db.query(
          `UPDATE inventory 
           SET quantity = quantity - $1, updated_at = now()
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

      // Commit transaction
      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          order_id: orderId,
          total_amount: totalAmount,
          status: 'pending',
        },
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  }
};

// Get user's orders
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { status } = req.query;

    let query = `
      SELECT 
        o.id,
        o.total_amount,
        o.shipping_fee,
        o.status,
        o.payment_status,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count,
        a.address_line,
        a.city,
        a.district
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN addresses a ON o.address_id = a.id
      WHERE o.user_id = $1
    `;

    const params: (string | undefined)[] = [userId];

    if (status && typeof status === 'string') {
      query += ` AND o.status = $2`;
      params.push(status);
    }

    query += `
      GROUP BY o.id, a.address_line, a.city, a.district
      ORDER BY o.created_at DESC
    `;

    const orders = await db.query(query, params);

    res.json({
      success: true,
      data: orders.rows,
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
    });
  }
};

// Get order detail
export const getOrderDetail = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { order_id } = req.params;

    // Get order info
    const order = await db.query(
      `SELECT 
        o.*,
        a.label as address_label,
        a.address_line,
        a.city,
        a.district,
        a.postal_code,
        a.phone as delivery_phone
       FROM orders o
       LEFT JOIN addresses a ON o.address_id = a.id
       WHERE o.id = $1 AND o.user_id = $2`,
      [order_id, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Get order items
    const items = await db.query(
      `SELECT 
        oi.*,
        (SELECT url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1) as image_url
       FROM order_items oi
       WHERE oi.order_id = $1`,
      [order_id]
    );

    res.json({
      success: true,
      data: {
        order: order.rows[0],
        items: items.rows,
      },
    });
  } catch (error) {
    console.error('Error getting order detail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order detail',
    });
  }
};

// Update order status (for admin or testing)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { order_id } = req.params;
    const { status, payment_status } = req.body;

    const updates: string[] = [];
    const params: (string | undefined)[] = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (payment_status) {
      updates.push(`payment_status = $${paramCount}`);
      params.push(payment_status);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No updates provided',
      });
    }

    updates.push(`updated_at = now()`);
    params.push(order_id);

    const query = `
      UPDATE orders 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Order updated',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
    });
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { order_id } = req.params;

    // Check if order exists and belongs to user
    const order = await db.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [order_id, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only allow canceling pending orders
    if (order.rows[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled',
      });
    }

    await db.query('BEGIN');

    try {
      // Get order items to restore inventory
      const items = await db.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
        [order_id]
      );

      // Restore inventory
      for (const item of items.rows) {
        await db.query(
          `UPDATE inventory 
           SET quantity = quantity + $1, updated_at = now()
           WHERE product_id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // Update order status
      await db.query(
        `UPDATE orders SET status = $1, updated_at = now() WHERE id = $2`,
        ['cancelled', order_id]
      );

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
    });
  }
};
