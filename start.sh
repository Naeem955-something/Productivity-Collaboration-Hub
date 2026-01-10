#!/bin/bash

echo "🚀 Starting Task Manager Application..."
echo ""

# Start MySQL
echo "1️⃣  Starting MySQL..."
sudo service mysql start
sleep 2

# Create database if not exists
echo "2️⃣  Setting up database..."
mysql -u root -p'u11das6532@r' -e "CREATE DATABASE IF NOT EXISTS productivity_hub;" 2>/dev/null

# Start Backend
echo "3️⃣  Starting backend (port 8080)..."
cd backend
mvn spring-boot:run -DskipTests > ../backend.log 2>&1 &
cd ..

# Wait for backend
echo "⏳ Waiting for backend to start (15 seconds)..."
sleep 15

# Start Frontend
echo "4️⃣  Starting frontend (port 3000)..."
echo ""
echo "✅ Backend running at: http://localhost:8080"
echo "✅ Frontend starting at: http://localhost:3000"
echo ""
echo "To stop: Press Ctrl+C, then run: pkill -f \"mvn spring-boot:run\""
echo ""

cd frontend
npm run dev
