import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kitchenly_db',
  user: process.env.DB_USER || 'kitchenly',
  password: process.env.DB_PASSWORD || 'kitchenly_password',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
