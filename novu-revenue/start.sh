#!/bin/bash
echo "Starting Novu..."
cd ~/novu/backend && node src/server.js &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID) on http://localhost:3001"

cd ~/novu/frontend && npm run dev -- --port 3000 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID) on http://localhost:3000"

echo ""
echo "=== Novu Running ==="
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Login:    admin@demostore.com / demo1234"
echo ""
wait
