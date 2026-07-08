import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import categoriesRoutes from './routes/categories';
import stockRoutes from './routes/stock';
import salesRoutes from './routes/sales';
import usersRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import searchRoutes from './routes/search';
import reportsRoutes from './routes/reports';
import { runMigrations } from './database/migrations';
import seedDatabase from './database/seeders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
const startServer = async () => {
  try {
    console.log('\n🔧 Running database migrations...');
    await runMigrations();

    console.log('🌱 Seeding database...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n✅ KITCHENLY Backend running on http://localhost:${PORT}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/api`);
      console.log('\n🔐 Default Admin Credentials:');
      console.log('   Username: admin');
      console.log('   Password: Admin@123');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
