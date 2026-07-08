import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all categories
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
router.post('/', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
