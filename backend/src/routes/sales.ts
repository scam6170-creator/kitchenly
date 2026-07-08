import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// Create sale
router.post('/', authMiddleware, roleMiddleware(['Administrator', 'Seller']), async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, quantity, sale_price, customer_name, sale_date } = req.body;

    if (!product_id || !quantity || !sale_price) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check stock
    const productResult = await pool.query(
      'SELECT current_quantity, sale_price FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (productResult.rows[0].current_quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const totalAmount = sale_price * quantity;

    // Insert sale
    const saleResult = await pool.query(
      `INSERT INTO sales (product_id, quantity, sale_price, total_amount, customer_name, sold_by, sale_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [product_id, quantity, sale_price, totalAmount, customer_name || 'Walk-in', req.user?.id, sale_date || new Date().toISOString().split('T')[0]]
    );

    // Update product quantity
    const newQuantity = productResult.rows[0].current_quantity - quantity;
    const status = newQuantity > 0 ? 'Available' : 'Out of Stock';

    await pool.query(
      'UPDATE products SET current_quantity = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newQuantity, status, product_id]
    );

    res.status(201).json(saleResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Get all sales
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date, page = 1, limit = 20 } = req.query;
    let query = `SELECT s.*, p.name as product_name, u.full_name as seller_name
                 FROM sales s
                 JOIN products p ON s.product_id = p.id
                 LEFT JOIN users u ON s.sold_by = u.id`;
    const params: any[] = [];
    let whereConditions = [];

    if (start_date) {
      whereConditions.push(`s.sale_date >= $${params.length + 1}`);
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`s.sale_date <= $${params.length + 1}`);
      params.push(end_date);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ` ORDER BY s.sale_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, ((+page - 1) * +limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get daily sales
router.get('/daily/summary', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT COUNT(*) as total_sales, COALESCE(SUM(total_amount), 0) as total_revenue,
              COALESCE(SUM(total_amount) - SUM(quantity * (SELECT purchase_price FROM products p WHERE p.id = s.product_id)), 0) as profit
       FROM sales s WHERE s.sale_date = $1`,
      [today]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
});

export default router;
