import { Request, Response } from 'express';
import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';

interface CreatePaymentRequest {
  order_id: string;
  payment_method: 'cod' | 'bank_transfer' | 'momo' | 'zalopay';
}

interface ProcessPaymentRequest {
  payment_id: string;
  provider_transaction_id?: string;
}

// Create payment for an order
export const createPayment = async (req: Request<Record<string, never>, Record<string, never>, CreatePaymentRequest>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { order_id, payment_method } = req.body;

    if (!order_id || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and payment method are required',
      });
    }

    // Validate payment method
    const validMethods = ['cod', 'bank_transfer', 'momo', 'zalopay'];
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    // Verify order exists and belongs to user
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

    const orderData = order.rows[0];

    // Check if order is already paid
    if (orderData.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    // Check if there's already a pending payment
    const existingPayment = await db.query(
      `SELECT * FROM payments 
       WHERE order_id = $1 AND status IN ('pending', 'processing')
       ORDER BY created_at DESC
       LIMIT 1`,
      [order_id]
    );

    if (existingPayment.rows.length > 0) {
      return res.json({
        success: true,
        message: 'Payment already exists',
        data: {
          payment_id: existingPayment.rows[0].id,
          order_id,
          amount: existingPayment.rows[0].amount,
          status: existingPayment.rows[0].status,
          payment_method,
        },
      });
    }

    // For COD, automatically mark as paid
    let paymentStatus = 'pending';
    let orderPaymentStatus = 'unpaid';

    if (payment_method === 'cod') {
      paymentStatus = 'completed';
      orderPaymentStatus = 'paid';
    }

    await db.query('BEGIN');

    try {
      // Create payment record
      const payment = await db.query(
        `INSERT INTO payments (id, order_id, payment_provider, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          uuidv4(),
          order_id,
          payment_method,
          orderData.total_amount,
          'VND',
          paymentStatus,
        ]
      );

      const paymentId = payment.rows[0].id;

      // Update order payment status
      await db.query(
        `UPDATE orders 
         SET payment_status = $1, updated_at = now()
         WHERE id = $2`,
        [orderPaymentStatus, order_id]
      );

      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: {
          payment_id: paymentId,
          order_id,
          amount: parseFloat(orderData.total_amount),
          currency: 'VND',
          status: paymentStatus,
          payment_method,
          ...(payment_method !== 'cod' && {
            payment_url: `/api/payments/${paymentId}/process`,
          }),
        },
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
    });
  }
};

// Process payment (simulate payment gateway)
export const processPayment = async (req: Request<{ payment_id: string }, Record<string, never>, ProcessPaymentRequest>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { payment_id } = req.params;
    const { provider_transaction_id } = req.body;

    // Get payment info
    const payment = await db.query(
      `SELECT p.*, o.user_id, o.payment_status as order_payment_status
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1`,
      [payment_id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const paymentData = payment.rows[0];

    // Verify payment belongs to user
    if (paymentData.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if already processed
    if (paymentData.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already completed',
        data: {
          payment_id,
          status: 'completed',
        },
      });
    }

    if (paymentData.status === 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has failed and cannot be processed',
      });
    }

    await db.query('BEGIN');

    try {
      // Simulate payment processing (in real app, this would call payment gateway)
      // For demo purposes, we'll auto-complete after a short delay simulation
      const paymentStatus = 'completed';
      const transactionId = provider_transaction_id || `TXN-${Date.now()}`;

      // Update payment
      await db.query(
        `UPDATE payments 
         SET status = $1, 
             provider_transaction_id = $2,
             created_at = now()
         WHERE id = $3`,
        [paymentStatus, transactionId, payment_id]
      );

      // Update order payment status
      await db.query(
        `UPDATE orders 
         SET payment_status = $1, updated_at = now()
         WHERE id = $2`,
        ['paid', paymentData.order_id]
      );

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          payment_id,
          order_id: paymentData.order_id,
          status: paymentStatus,
          transaction_id: transactionId,
        },
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
    });
  }
};

// Get payment status
export const getPaymentStatus = async (req: Request<{ payment_id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { payment_id } = req.params;

    const payment = await db.query(
      `SELECT p.*, o.user_id, o.status as order_status, o.payment_status as order_payment_status
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1`,
      [payment_id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const paymentData = payment.rows[0];

    // Verify payment belongs to user
    if (paymentData.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: {
        payment_id,
        order_id: paymentData.order_id,
        amount: parseFloat(paymentData.amount),
        currency: paymentData.currency,
        status: paymentData.status,
        payment_provider: paymentData.payment_provider,
        provider_transaction_id: paymentData.provider_transaction_id,
        order_status: paymentData.order_status,
        order_payment_status: paymentData.order_payment_status,
        created_at: paymentData.created_at,
      },
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
    });
  }
};

// Get payments for an order
export const getOrderPayments = async (req: Request<{ order_id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { order_id } = req.params;

    // Verify order belongs to user
    const order = await db.query(
      `SELECT id FROM orders WHERE id = $1 AND user_id = $2`,
      [order_id, userId]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Get all payments for this order
    const payments = await db.query(
      `SELECT * FROM payments 
       WHERE order_id = $1 
       ORDER BY created_at DESC`,
      [order_id]
    );

    res.json({
      success: true,
      data: payments.rows.map((p) => ({
        payment_id: p.id,
        order_id: p.order_id,
        amount: parseFloat(p.amount),
        currency: p.currency,
        status: p.status,
        payment_provider: p.payment_provider,
        provider_transaction_id: p.provider_transaction_id,
        created_at: p.created_at,
      })),
    });
  } catch (error) {
    console.error('Error getting order payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order payments',
    });
  }
};

// Cancel payment (only for pending payments)
export const cancelPayment = async (req: Request<{ payment_id: string }>, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { payment_id } = req.params;

    // Get payment info
    const payment = await db.query(
      `SELECT p.*, o.user_id
       FROM payments p
       JOIN orders o ON p.order_id = o.id
       WHERE p.id = $1`,
      [payment_id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const paymentData = payment.rows[0];

    // Verify payment belongs to user
    if (paymentData.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Only allow canceling pending payments
    if (paymentData.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payments can be cancelled',
      });
    }

    await db.query(
      `UPDATE payments 
       SET status = $1
       WHERE id = $2`,
      ['cancelled', payment_id]
    );

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payment',
    });
  }
};

