import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// Add stock entry
router.post('/', authMiddleware, roleMiddleware(['Administrator', 'Warehouse']), async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, quantity, purchase_price, supplier, notes, entry_date } = req.body;

    if (!product_id || !quantity || !purchase_price) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Insert stock entry
    const entryResult = await pool.query(
      `INSERT INTO stock_entries (product_id, quantity, purchase_price, supplier, notes, entered_by, entry_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [product_id, quantity, purchase_price, supplier, notes, req.user?.id, entry_date || new Date().toISOString().split('T')[0]]
    );

    // Update product quantity
    const productResult = await pool.query(
      'SELECT current_quantity, minimum_quantity FROM products WHERE id = $1',
      [product_id]
    );

    const newQuantity = productResult.rows[0].current_quantity + parseInt(quantity);
    const status = newQuantity > productResult.rows[0].minimum_quantity ? 'Available' : 'Out of Stock';

    await pool.query(
      'UPDATE products SET current_quantity = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newQuantity, status, product_id]
    );

    res.status(201).json(entryResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Get stock entries
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { product_id, page = 1, limit = 20 } = req.query;
    let query = `SELECT se.*, p.name as product_name, u.full_name as entered_by_name
                 FROM stock_entries se
                 JOIN products p ON se.product_id = p.id
                 LEFT JOIN users u ON se.entered_by = u.id`;
    const params: any[] = [];

    if (product_id) {
      query += ` WHERE se.product_id = $1`;
      params.push(product_id);
    }

    query += ` ORDER BY se.entry_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, ((+page - 1) * +limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock entries' });
  }
});

// Get low stock products
router.get('/low-stock/alert', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE current_quantity <= minimum_quantity AND status = 'Out of Stock'
       ORDER BY current_quantity ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

export default router;
