import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Daily report
router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const sales = await pool.query(
      `SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as revenue
       FROM sales WHERE sale_date = $1`,
      [reportDate]
    );

    const stock = await pool.query(
      `SELECT COUNT(*) as entries, COALESCE(SUM(quantity), 0) as total_quantity
       FROM stock_entries WHERE entry_date = $1`,
      [reportDate]
    );

    res.json({
      date: reportDate,
      sales: sales.rows[0],
      stock: stock.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate daily report' });
  }
});

// Weekly report
router.get('/weekly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC('week', sale_date)::date as week_start,
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE sale_date >= CURRENT_DATE - INTERVAL '8 weeks'
       GROUP BY DATE_TRUNC('week', sale_date)
       ORDER BY week_start DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate weekly report' });
  }
});

// Monthly report
router.get('/monthly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        DATE_TRUNC('month', sale_date)::date as month,
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       WHERE sale_date >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', sale_date)
       ORDER BY month DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate monthly report' });
  }
});

// Yearly report
router.get('/yearly', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        EXTRACT(YEAR FROM sale_date)::integer as year,
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM sales
       GROUP BY EXTRACT(YEAR FROM sale_date)
       ORDER BY year DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate yearly report' });
  }
});

// Best selling products
router.get('/best-selling', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'monthly' } = req.query;
    let dateFilter = "CURRENT_DATE - INTERVAL '30 days'";
    
    if (period === 'weekly') {
      dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
    } else if (period === 'yearly') {
      dateFilter = "CURRENT_DATE - INTERVAL '365 days'";
    }

    const result = await pool.query(`
      SELECT p.id, p.name, SUM(s.quantity) as total_sold, SUM(s.total_amount) as revenue
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.sale_date >= ${dateFilter}
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate best selling report' });
  }
});

// Stock report
router.get('/stock', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.current_quantity, p.minimum_quantity, p.status, 
              c.name as category_name, p.purchase_price, p.sale_price
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.current_quantity ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate stock report' });
  }
});

// Profit report
router.get('/profit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    let query = `
      SELECT 
        SUM(s.total_amount) as total_sales,
        SUM(s.quantity * p.purchase_price) as total_cost,
        SUM(s.total_amount) - SUM(s.quantity * p.purchase_price) as profit,
        ROUND(((SUM(s.total_amount) - SUM(s.quantity * p.purchase_price)) / SUM(s.total_amount) * 100)::numeric, 2) as profit_margin
      FROM sales s
      JOIN products p ON s.product_id = p.id
    `;
    const params: any[] = [];
    let conditions = [];

    if (start_date) {
      conditions.push(`s.sale_date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`s.sale_date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate profit report' });
  }
});

export default router;
