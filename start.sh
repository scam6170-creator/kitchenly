#!/bin/bash

echo "🚀 Starting KITCHENLY"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Backend starting... (Terminal 1)${NC}"
echo "cd backend && npm run dev"
echo ""
echo -e "${YELLOW}Frontend starting... (Terminal 2)${NC}"
echo "cd frontend && npm run dev"
echo ""
echo -e "${GREEN}Open browser: http://localhost:3000${NC}"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both
wait
