import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import bcryptjs from 'bcryptjs';

const router = express.Router();

// Get all products
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    const params: any[] = [];
    let whereConditions = [];

    if (search) {
      whereConditions.push(`(p.name ILIKE $${params.length + 1} OR p.barcode ILIKE $${params.length + 1})`);
      params.push(`%${search}%`);
    }

    if (category) {
      whereConditions.push(`c.id = $${params.length + 1}`);
      params.push(category);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, ((+page - 1) * +limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authMiddleware, roleMiddleware(['Administrator', 'Warehouse']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, category_id, brand, barcode, purchase_price, sale_price, current_quantity, minimum_quantity, description, image_url } = req.body;

    if (!name || !barcode || !purchase_price || !sale_price) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const result = await pool.query(
      `INSERT INTO products (name, category_id, brand, barcode, purchase_price, sale_price, current_quantity, minimum_quantity, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [name, category_id, brand, barcode, purchase_price, sale_price, current_quantity || 0, minimum_quantity || 10, description, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Barcode already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authMiddleware, roleMiddleware(['Administrator', 'Warehouse']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category_id, brand, barcode, purchase_price, sale_price, current_quantity, minimum_quantity, description, image_url, status } = req.body;

    const result = await pool.query(
      `UPDATE products SET name = $1, category_id = $2, brand = $3, barcode = $4, purchase_price = $5, sale_price = $6,
       current_quantity = $7, minimum_quantity = $8, description = $9, image_url = $10, status = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
      [name, category_id, brand, barcode, purchase_price, sale_price, current_quantity, minimum_quantity, description, image_url, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
