#!/bin/bash

# KITCHENLY Local Development Setup

echo "🛠️ Setting up KITCHENLY for local development..."
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) found"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env already exists"
fi

cd ..
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env already exists"
fi

cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start PostgreSQL (local or Docker)"
echo "   2. Backend: cd backend && npm run dev"
echo "   3. Frontend: cd frontend && npm run dev"
echo "   4. Open http://localhost:3000"
echo ""
