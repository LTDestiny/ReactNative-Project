import { Request, Response } from 'express';
import { db } from '../database';

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const [
      usersResult,
      productsResult,
      orderSummaryResult,
      todayOrdersResult,
      revenueTrendResult,
      recentOrdersResult,
      lowStockResult,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*)::int as total_users FROM users`),
      db.query(`SELECT COUNT(*)::int as total_products FROM products`),
      db.query(
        `SELECT 
            COUNT(*)::int as total_orders,
            COALESCE(SUM(total_amount), 0)::numeric as total_revenue,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int as pending_orders,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)::int as confirmed_orders,
            SUM(CASE WHEN status = 'shipping' THEN 1 ELSE 0 END)::int as shipping_orders,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)::int as delivered_orders,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)::int as cancelled_orders
         FROM orders`
      ),
      db.query(
        `SELECT COUNT(*)::int as today_orders
         FROM orders
         WHERE created_at::date = CURRENT_DATE`
      ),
      db.query(
        `SELECT 
            TO_CHAR(created_at::date, 'YYYY-MM-DD') as date,
            COALESCE(SUM(total_amount), 0)::numeric as revenue
         FROM orders
         WHERE created_at >= NOW() - INTERVAL '7 days'
         GROUP BY created_at::date
         ORDER BY date`
      ),
      db.query(
        `SELECT 
            o.id,
            o.total_amount,
            o.payment_status,
            o.status,
            o.created_at,
            u.full_name as customer_name
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC
         LIMIT 5`
      ),
      db.query(
        `SELECT 
            p.id,
            p.name,
            COALESCE(i.quantity, 0) as stock
         FROM products p
         LEFT JOIN inventory i ON p.id = i.product_id
         WHERE COALESCE(i.quantity, 0) <= 5
         ORDER BY stock ASC
         LIMIT 5`
      ),
    ]);

    const orderSummary = orderSummaryResult.rows[0];

    res.json({
      success: true,
      data: {
        summary: {
          total_users: usersResult.rows[0].total_users,
          total_products: productsResult.rows[0].total_products,
          total_orders: orderSummary.total_orders,
          total_revenue: parseFloat(orderSummary.total_revenue),
          today_orders: todayOrdersResult.rows[0].today_orders,
        },
        orders: {
          status_breakdown: {
            pending: orderSummary.pending_orders,
            confirmed: orderSummary.confirmed_orders,
            shipping: orderSummary.shipping_orders,
            delivered: orderSummary.delivered_orders,
            cancelled: orderSummary.cancelled_orders,
          },
          recent: recentOrdersResult.rows,
        },
        revenue_trend: revenueTrendResult.rows.map((row) => ({
          date: row.date,
          revenue: parseFloat(row.revenue),
        })),
        inventory: {
          low_stock: lowStockResult.rows,
        },
      },
    });
  } catch (error) {
    console.error('Error getting admin dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load admin dashboard',
    });
  }
};

