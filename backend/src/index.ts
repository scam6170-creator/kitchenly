import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'kitchenly',
  password: process.env.DB_PASSWORD || 'kitchenly123',
  database: process.env.DB_NAME || 'kitchenly',
});

client.connect().catch(console.error);

// Initialize Database
async function initDatabase() {
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        role VARCHAR(50) DEFAULT 'Staff',
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category_id UUID REFERENCES categories(id),
        brand VARCHAR(255),
        barcode VARCHAR(255) UNIQUE NOT NULL,
        purchase_price DECIMAL(10,2),
        sale_price DECIMAL(10,2) NOT NULL,
        current_quantity INTEGER DEFAULT 0,
        minimum_quantity INTEGER DEFAULT 10,
        status VARCHAR(50) DEFAULT 'Available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Stock table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        entry_type VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        sale_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables created/verified');

    // Seed admin user if not exists
    const adminCheck = await client.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );

    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await client.query(
        `INSERT INTO users (id, username, password_hash, full_name, role, email) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), 'admin', hashedPassword, 'Administrator', 'Administrator', 'admin@kitchenly.com']
      );
      console.log('✅ Admin user created');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// JWT Middleware
const authMiddleware = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-12345');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Backend is running! ✅' });
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-12345',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get Products
app.get('/api/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await client.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create Product
app.post('/api/products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, category_id, brand, barcode, purchase_price, sale_price, minimum_quantity } = req.body;
    const id = uuidv4();

    await client.query(
      `INSERT INTO products (id, name, category_id, brand, barcode, purchase_price, sale_price, minimum_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, name, category_id, brand, barcode, purchase_price, sale_price, minimum_quantity]
    );

    res.json({ id, message: 'Product created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get Categories
app.get('/api/categories', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await client.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Dashboard Summary
app.get('/api/dashboard/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    const todaySales = await client.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total 
       FROM sales WHERE sale_date = CURRENT_DATE`
    );

    const lowStock = await client.query(
      `SELECT COUNT(*) as count FROM products WHERE current_quantity <= minimum_quantity`
    );

    const totalProducts = await client.query('SELECT COUNT(*) as count FROM products');

    res.json({
      todays_sales: todaySales.rows[0],
      todays_profit: { profit: (todaySales.rows[0].total * 0.3).toFixed(2) },
      low_stock_products: lowStock.rows[0],
      total_products: totalProducts.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Recent Sales
app.get('/api/dashboard/recent-sales', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await client.query(`
      SELECT s.id, p.name as product_name, s.quantity, s.total_amount, s.sale_date
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Top Products
app.get('/api/dashboard/top-products', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await client.query(`
      SELECT p.name, SUM(s.quantity) as total_sold
      FROM sales s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Monthly Revenue
app.get('/api/dashboard/monthly-revenue', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await client.query(`
      SELECT 
        TO_CHAR(sale_date, 'Mon') as month,
        SUM(total_amount) as revenue
      FROM sales
      WHERE EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY sale_date
      ORDER BY sale_date
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
});

// Add Stock
app.post('/api/stock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { product_id, quantity, entry_type } = req.body;
    const id = uuidv4();

    await client.query(
      `INSERT INTO stock (id, product_id, quantity, entry_type) VALUES ($1, $2, $3, $4)`,
      [id, product_id, quantity, entry_type]
    );

    // Update product quantity
    await client.query(
      'UPDATE products SET current_quantity = current_quantity + $1 WHERE id = $2',
      [quantity, product_id]
    );

    res.json({ id, message: 'Stock added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// Create Sale
app.post('/api/sales', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { product_id, quantity, unit_price, total_amount, payment_method } = req.body;
    const id = uuidv4();

    await client.query(
      `INSERT INTO sales (id, product_id, quantity, unit_price, total_amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, product_id, quantity, unit_price, total_amount, payment_method]
    );

    // Update product quantity
    await client.query(
      'UPDATE products SET current_quantity = current_quantity - $1 WHERE id = $2',
      [quantity, product_id]
    );

    res.json({ id, message: 'Sale recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Get Users
app.get('/api/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await client.query('SELECT id, username, full_name, role, status, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create User
app.post('/api/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { username, password, full_name, role, email } = req.body;
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (id, username, password_hash, full_name, role, email)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, username, hashedPassword, full_name, role, email]
    );

    res.json({ id, message: 'User created' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Daily Report
app.get('/api/reports/daily', authMiddleware, async (req: Request, res: Response) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const result = await client.query(
      `SELECT DATE($1) as date, COUNT(*) as sales_count, SUM(total_amount) as total_revenue
       FROM sales WHERE DATE(sale_date) = DATE($1)`,
      [date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Start Server
app.listen(port, async () => {
  await initDatabase();
  console.log(`
🚀 Backend Server Running!
`);
  console.log(`📍 http://localhost:${port}`);
  console.log(`✅ Database: Connected`);
  console.log(`\n📝 Credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: Admin@123\n`);
});

export default app;
