# PriorityForge

A full-stack application for managing and prioritizing tasks using a custom priority queue algorithm engine.

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: React (Vite)
- **Database**: SQLite via SQLAlchemy
- **Priority Engine**: Custom priority queue algorithms

## Project Structure

```
root/
  backend/          # FastAPI backend application
  frontend/         # React frontend application
  docs/            # Project documentation
  scripts/         # Utility scripts
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Future Features

- Analytics dashboard
- ML-based priority recommendations
- Advanced scheduling algorithms

