import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Global search
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = `%${q}%`;

    const results = await pool.query(
      `SELECT 
        p.id, p.name, p.barcode, p.category_id, p.purchase_price, p.sale_price, 
        p.current_quantity, p.image_url, p.status,
        c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.name ILIKE $1 OR p.barcode ILIKE $1 OR c.name ILIKE $1 OR p.brand ILIKE $1
       ORDER BY p.name ASC
       LIMIT 50`,
      [searchTerm]
    );

    res.json(results.rows);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
