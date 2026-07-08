import pool from './connection';

export async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Administrator', 'Warehouse', 'Seller')),
        status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Blocked', 'Inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE SET NULL,
        brand VARCHAR(255),
        barcode VARCHAR(255) UNIQUE NOT NULL,
        purchase_price DECIMAL(10, 2) NOT NULL,
        sale_price DECIMAL(10, 2) NOT NULL,
        current_quantity INTEGER DEFAULT 0,
        minimum_quantity INTEGER DEFAULT 10,
        description TEXT,
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Out of Stock')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stock entries table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        purchase_price DECIMAL(10, 2) NOT NULL,
        supplier VARCHAR(255),
        notes TEXT,
        entered_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        entry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sales table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        sale_price DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        customer_name VARCHAR(255),
        sold_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        sale_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_name VARCHAR(255) DEFAULT 'KITCHENLY',
        logo_url VARCHAR(255),
        theme VARCHAR(50) DEFAULT 'light',
        language VARCHAR(50) DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_stock_entries_product ON stock_entries(product_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date)`);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default runMigrations;
