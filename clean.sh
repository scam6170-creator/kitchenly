#!/bin/bash

echo "🧹 KITCHENLY - Clean & Reset"
echo ""

# Kill processes
echo "Stopping processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

echo "Cleaning node_modules..."
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/dist frontend/dist

echo "Removing lock files..."
rm -f backend/package-lock.json frontend/package-lock.json

echo "✅ Clean complete!"
echo ""
echo "Run: bash setup.sh"
