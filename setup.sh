#!/bin/bash

echo "🚀 KITCHENLY - Automatic Setup"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found. Install from https://www.postgresql.org/download/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL found${NC}"
echo ""

# Backend Setup
echo -e "${YELLOW}📦 Backend Setup${NC}"
cd backend

if [ ! -f ".env" ]; then
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
    echo -e "${GREEN}✅ Backend .env created${NC}"
else
    echo -e "${GREEN}✅ Backend .env already exists${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Backend dependencies already installed${NC}"
fi

cd ..
echo ""

# Frontend Setup
echo -e "${YELLOW}🎨 Frontend Setup${NC}"
cd frontend

if [ ! -f ".env" ]; then
    cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF
    echo -e "${GREEN}✅ Frontend .env created${NC}"
else
    echo -e "${GREEN}✅ Frontend .env already exists${NC}"
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

cd ..
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 - Backend:${NC}"
echo "  cd backend && npm run dev"
echo ""
echo -e "${YELLOW}Terminal 2 - Frontend:${NC}"
echo "  cd frontend && npm run dev"
echo ""
echo -e "${YELLOW}Then open:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Login:${NC}"
echo "  Username: admin"
echo "  Password: Admin@123"
echo ""
