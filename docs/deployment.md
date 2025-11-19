# Deployment Guide

## Local Development

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

### Backend
1. Set environment variables
2. Initialize database: `python -c "from database.connection import init_db; init_db()"`
3. Run with production server: `uvicorn main:app --host 0.0.0.0 --port 8000`

### Frontend
1. Build: `npm run build`
2. Serve with nginx or similar static file server

## Docker (Future)
- Dockerfile for backend
- Dockerfile for frontend
- docker-compose.yml for full stack

## Cloud Deployment
- Backend: AWS, GCP, or Azure
- Frontend: Vercel, Netlify, or AWS S3
- Database: Managed SQLite or PostgreSQL migration

