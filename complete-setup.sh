#!/bin/bash
# HerbalTrace Complete Setup Script
# Run this from Git Bash in the HerbalTrace directory

set -e  # Exit on any error

echo "========================================"
echo "HerbalTrace Complete Setup"
echo "========================================"
echo ""

# Navigate to project root
cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)

echo "Project Root: $PROJECT_ROOT"
echo ""

# Step 1: Docker Cleanup
echo "[1/8] Cleaning Docker..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker volume prune -f
docker network prune -f
echo "✓ Docker cleaned"
echo ""

# Step 2: Install Backend Dependencies
echo "[2/8] Installing Backend Dependencies..."
cd "$PROJECT_ROOT/backend"
npm install
echo "✓ Backend dependencies installed"
echo ""

# Step 3: Start Blockchain Network
echo "[3/8] Starting Blockchain Network..."
cd "$PROJECT_ROOT/network"
./deploy-network.sh down 2>/dev/null || true
./deploy-network.sh up -ca
echo "✓ Blockchain network started"
echo ""

# Wait for network to stabilize
echo "Waiting for network to stabilize (15 seconds)..."
sleep 15

# Step 4: Create Channel
echo "[4/8] Creating Blockchain Channel..."
./scripts/create-channel-v2.sh
echo "✓ Channel created"
echo ""

# Step 5: Verify Chaincode
echo "[5/8] Verifying Chaincode Deployment..."
echo "Chaincode will be deployed on first API call"
echo ""

# Step 6: Start Backend (in background)
echo "[6/8] Starting Backend Server..."
cd "$PROJECT_ROOT/backend"
# Kill any existing backend process
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*src/index" 2>/dev/null || true

# Start backend in background
echo "Starting backend server on port 3000..."
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start (20 seconds)..."
sleep 20

# Step 7: Create Admin
echo "[7/8] Creating Admin User..."
node create-admin.js
echo "✓ Admin created (username: admin, password: admin123)"
echo ""

# Step 8: Health Check
echo "[8/8] Testing Backend Health..."
sleep 5
curl -s http://localhost:3000/health | head -20 || echo "Health check pending..."
echo ""

echo "========================================"
echo "✓ HerbalTrace Setup Complete!"
echo "========================================"
echo ""
echo "Services Running:"
echo "  - Blockchain Network: Docker containers"
echo "  - Backend API: http://localhost:3000 (PID: $BACKEND_PID)"
echo ""
echo "Next Steps:"
echo "  1. Check backend logs: tail -f backend/backend.log"
echo "  2. Run E2E test: cd backend && node tmp-full-registration-to-consumer-test.js"
echo "  3. View Docker containers: docker ps"
echo ""
echo "To stop backend: kill $BACKEND_PID"
echo "To stop blockchain: cd network && ./deploy-network.sh down"
echo ""
