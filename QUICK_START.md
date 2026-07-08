# KITCHENLY - Quick Start Guide 🚀

## Eng Tez Boshlash (Local Setup)

### 1️⃣ Prerequisites Install Qil

**Node.js 18+** - https://nodejs.org/
**PostgreSQL** - https://www.postgresql.org/download/

### 2️⃣ Database Setup

```bash
# PostgreSQL start qil (Mac/Linux)
postgres -D /usr/local/var/postgres

# Database va user yaratish
psql postgres

# Terminal'da:
CREATE USER kitchenly WITH PASSWORD 'kitchenly123';
CREATE DATABASE kitchenly OWNER kitchenly;
ALTER USER kitchenly CREATEDB;
\q
```

### 3️⃣ Backend Setup

```bash
cd backend
npm install

# .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=kitchenly
DB_PASSWORD=kitchenly123
DB_NAME=kitchenly
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-12345
EOF

# Start Backend
npm run dev
```

**Backend running:** http://localhost:5000/health ✅

### 4️⃣ Frontend Setup (New Terminal)

```bash
cd frontend
npm install

# .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Start Frontend
npm run dev
```

**Frontend running:** http://localhost:3000 ✅

### 5️⃣ Login

```
Username: admin
Password: Admin@123
```

---

## 🆘 Muammolar

### Port 3000 or 5000 busy?
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Error?
```bash
# PostgreSQL running?
psql -U kitchenly -d kitchenly -h localhost

# Agar failed:
psql postgres
DROP DATABASE kitchenly;
DROP USER kitchenly;
# Qayta 2-qadamdan qil
```

### npm Error?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Success!

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

**Hammasi ishlayapti!** 🎉
