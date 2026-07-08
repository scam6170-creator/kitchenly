import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get dashboard data
router.get('/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Today's sales
    const todaysSales = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
       FROM sales WHERE sale_date = $1`,
      [today]
    );

    // Total products
    const totalProducts = await pool.query('SELECT COUNT(*) as count FROM products');

    // Low stock products
    const lowStockProducts = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE current_quantity <= minimum_quantity'
    );

    // Monthly revenue
    const monthlyRevenue = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM sales
       WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)`
    );

    // Calculate profit
    const profit = await pool.query(
      `SELECT COALESCE(SUM(s.total_amount - (s.quantity * (SELECT purchase_price FROM products p WHERE p.id = s.product_id))), 0) as profit
       FROM sales s WHERE s.sale_date = $1`,
      [today]
    );

    res.json({
      todays_sales: todaysSales.rows[0],
      todays_profit: profit.rows[0],
      total_products: totalProducts.rows[0],
      low_stock_products: lowStockProducts.rows[0],
      monthly_revenue: monthlyRevenue.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Recent sales
router.get('/recent-sales', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, p.name as product_name, u.full_name as seller_name
       FROM sales s
       JOIN products p ON s.product_id = p.id
       LEFT JOIN users u ON s.sold_by = u.id
       ORDER BY s.created_at DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent sales' });
  }
});

// Recent stock entries
router.get('/recent-stock', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT se.*, p.name as product_name, u.full_name as entered_by_name
       FROM stock_entries se
       JOIN products p ON se.product_id = p.id
       LEFT JOIN users u ON se.entered_by = u.id
       ORDER BY se.created_at DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recent stock entries' });
  }
});

// Top selling products
router.get('/top-products', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, SUM(s.quantity) as total_sold, SUM(s.total_amount) as total_revenue
       FROM sales s
       JOIN products p ON s.product_id = p.id
       GROUP BY p.id, p.name
       ORDER BY total_sold DESC LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Monthly revenue chart
router.get('/monthly-revenue', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DATE_TRUNC('month', sale_date)::date as month, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE sale_date >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', sale_date)
       ORDER BY month`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly revenue' });
  }
});

export default router;
