import pool from '../connection';
import bcryptjs from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Check if admin already exists
    const adminExists = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );

    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcryptjs.hash('Admin@123', 10);
      await pool.query(
        `INSERT INTO users (full_name, username, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Administrator', 'admin', 'admin@kitchenly.com', hashedPassword, 'Administrator', 'Active']
      );
      console.log('✅ Admin user created');
    }

    // Insert default categories
    const categories = [
      { name: 'Kitchen Items', description: 'General kitchen items' },
      { name: 'Pots', description: 'Cooking pots' },
      { name: 'Pans', description: 'Cooking pans' },
      { name: 'Knives', description: 'Kitchen knives' },
      { name: 'Spoons', description: 'Kitchen spoons' },
      { name: 'Forks', description: 'Kitchen forks' },
      { name: 'Plates', description: 'Dinner plates' },
      { name: 'Bowls', description: 'Kitchen bowls' },
      { name: 'Tea Kettles', description: 'Tea kettles' },
      { name: 'Cups', description: 'Tea cups' },
      { name: 'Glass', description: 'Glass items' },
      { name: 'Kitchen Accessories', description: 'Various kitchen accessories' },
    ];

    for (const cat of categories) {
      const exists = await pool.query(
        'SELECT * FROM categories WHERE name = $1',
        [cat.name]
      );
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2)',
          [cat.name, cat.description]
        );
      }
    }
    console.log('✅ Categories seeded');

    // Insert default settings
    const settings = await pool.query('SELECT * FROM settings');
    if (settings.rows.length === 0) {
      await pool.query(
        `INSERT INTO settings (store_name, theme, language)
         VALUES ($1, $2, $3)`,
        ['KITCHENLY', 'light', 'en']
      );
      console.log('✅ Settings initialized');
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

export default seedDatabase;
