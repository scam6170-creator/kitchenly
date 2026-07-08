# KITCHENLY - Inventory & Sales Management System 🍳

## Overview

KITCHENLY is a comprehensive **Inventory and Sales Management System** designed for restaurants, cafes, and small food businesses. It provides real-time tracking of products, stock management, sales analytics, and employee management.

## Features ✨

### Core Features
- 📊 **Dashboard** - Real-time business metrics and analytics
- 🏷️ **Product Management** - Add, edit, delete products with categories
- 📦 **Stock Management** - Track inventory levels and low stock alerts
- 💰 **Sales Module** - Record and track daily sales
- 📈 **Reports** - Daily, weekly, monthly, and yearly reports
- 👥 **Employee Management** - Manage staff and roles
- 🔍 **Global Search** - Quick search across all products
- ⚙️ **Settings** - Customize store information
- 🌙 **Dark/Light Mode** - Theme switching
- 🌐 **Multi-language** - English and Uzbek support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

### Security Features
- 🔐 JWT Authentication
- 👤 Role-based Access Control (Administrator, Manager, Staff)
- 🔒 Password hashing with bcrypt
- 🛡️ Input validation and sanitization

## Tech Stack 🛠️

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **API**: RESTful

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Charts**: Recharts
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: Vite

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Version Control**: Git

## Project Structure 📁

```
kitchenly/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   ├── migrations.ts
│   │   │   └── seeders.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── categories.ts
│   │   │   ├── stock.ts
│   │   │   ├── sales.ts
│   │   │   ├── users.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── settings.ts
│   │   │   ├── search.ts
│   │   │   └── reports.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── Routes.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Stock.tsx
│   │   │   ├── Sales.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Search.tsx
│   │   ├── store/
│   │   │   ├── auth.ts
│   │   │   └── ui.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## Installation 🚀

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kitchenly.git
   cd kitchenly
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Update environment variables**
   ```bash
   # .env
   DB_USER=kitchenly
   DB_PASSWORD=your-secure-password
   DB_NAME=kitchenly
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start all services**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

### Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Configure database**
   ```bash
   # .env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=kitchenly
   DB_PASSWORD=kitchenly123
   DB_NAME=kitchenly
   PORT=5000
   JWT_SECRET=your-secret-key
   ```

5. **Start backend**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Start frontend**
   ```bash
   npm run dev
   ```

## Default Credentials 🔐

```
Username: admin
Password: Admin@123
Role: Administrator
```

## API Documentation 📖

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "full_name": "Administrator",
    "role": "Administrator"
  }
}
```

### Products Endpoints

#### List Products
```
GET /products?page=1&limit=10
Authorization: Bearer {token}
```

#### Create Product
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Burger",
  "category_id": "uuid",
  "brand": "Premium",
  "barcode": "123456789",
  "purchase_price": 5.00,
  "sale_price": 12.00,
  "minimum_quantity": 10
}
```

### Stock Endpoints

#### Add Stock
```
POST /stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 100,
  "entry_type": "initial"
}
```

### Sales Endpoints

#### Create Sale
```
POST /sales
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": "uuid",
  "quantity": 5,
  "unit_price": 12.00,
  "total_amount": 60.00,
  "payment_method": "cash"
}
```

### Reports Endpoints

#### Daily Report
```
GET /reports/daily?date=2024-01-15
Authorization: Bearer {token}
```

#### Weekly Report
```
GET /reports/weekly
Authorization: Bearer {token}
```

#### Profit Report
```
GET /reports/profit?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {token}
```

## Database Schema 📊

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  brand VARCHAR(255),
  barcode VARCHAR(255) UNIQUE NOT NULL,
  purchase_price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 10,
  status VARCHAR(50) DEFAULT 'Available',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sales Table
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  sale_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment 🚢

### Docker Deployment

1. **Build images**
   ```bash
   docker-compose build
   ```

2. **Start services**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Production Deployment

1. **Use environment variables**
   ```bash
   export NODE_ENV=production
   export DB_HOST=your-db-host
   export JWT_SECRET=your-production-secret
   ```

2. **Use production database**
   - Use managed PostgreSQL service (AWS RDS, DigitalOcean, etc.)
   - Configure connection pooling
   - Enable SSL/TLS

3. **Use production frontend build**
   ```bash
   npm run build
   ```

4. **Use reverse proxy (Nginx)**
   - Proxy API requests to backend
   - Serve frontend static files
   - Enable HTTPS/SSL
   - Configure CORS properly

## Security Best Practices 🔒

- ✅ Use strong JWT_SECRET
- ✅ Implement rate limiting
- ✅ Enable HTTPS/SSL
- ✅ Use environment variables for secrets
- ✅ Regularly update dependencies
- ✅ Implement input validation
- ✅ Use CORS properly
- ✅ Enable database encryption
- ✅ Implement audit logging
- ✅ Regular security backups

## Troubleshooting 🔧

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Clear frontend cache
rm -rf frontend/dist
npm run build
```

## Contributing 🤝

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 📧

For support, email support@kitchenly.com or create an issue on GitHub.

## Roadmap 🗓️

- [ ] Mobile app (React Native)
- [ ] Multi-branch support
- [ ] Accounting integration
- [ ] Payment gateway integration
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Supplier management
- [ ] Customer loyalty program

## Contributors ✨

- Your Name - Initial work

## Changelog 📝

### Version 1.0.0 (2024-01-15)
- Initial release
- Basic inventory management
- Sales tracking
- Reporting features
- User authentication
- Multi-language support

---

**Happy Cooking! 🍳✨**
