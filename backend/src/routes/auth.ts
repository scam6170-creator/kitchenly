import express, { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/connection';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND status = $2',
      [username, 'Active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { full_name, username, email, password, role } = req.body;

    if (!full_name || !username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, username, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, username, role`,
      [full_name, username, email, hashedPassword, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
