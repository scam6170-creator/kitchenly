import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// Get settings
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM settings LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { store_name, logo_url, theme, language } = req.body;

    const result = await pool.query(
      `UPDATE settings SET store_name = $1, logo_url = $2, theme = $3, language = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT id FROM settings LIMIT 1)
       RETURNING *`,
      [store_name, logo_url, theme, language]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
