import express, { Request, Response } from 'express';
import pool from '../database/connection';
import { AuthRequest, authMiddleware, roleMiddleware } from '../middleware/auth';
import bcryptjs from 'bcryptjs';

const router = express.Router();

// Get all users
router.get('/', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    let query = 'SELECT id, full_name, username, email, role, status, created_at FROM users';
    const params: any[] = [];
    let whereConditions = [];

    if (role) {
      whereConditions.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    if (status) {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, ((+page - 1) * +limit));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
router.post('/', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { full_name, username, email, password, role } = req.body;

    if (!full_name || !username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, username, email, role, status, created_at`,
      [full_name, username, email, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, status } = req.body;

    const result = await pool.query(
      `UPDATE users SET full_name = $1, email = $2, role = $3, status = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, full_name, username, email, role, status, created_at`,
      [full_name, email, role, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Reset password
router.post('/:id/reset-password', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return res.status(400).json({ error: 'New password required' });
    }

    const hashedPassword = await bcryptjs.hash(new_password, 10);

    const result = await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Delete user
router.delete('/:id', authMiddleware, roleMiddleware(['Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
