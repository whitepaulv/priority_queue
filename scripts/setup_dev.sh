#!/bin/bash
# Development environment setup script.
# Sets up both backend and frontend development environments.

set -e

echo "Setting up PriorityForge development environment..."

# Backend setup
echo "Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "Backend setup complete!"

# Frontend setup
echo "Setting up frontend..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
echo "Frontend setup complete!"

cd ..
echo "Development environment setup complete!"
echo ""
echo "To start the backend:"
echo "  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"

