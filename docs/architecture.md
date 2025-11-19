# Architecture Overview

## System Architecture

PriorityForge is built with a clean separation of concerns:

### Backend Architecture
- **API Layer**: FastAPI routes and request handling
- **Service Layer**: Business logic and orchestration
- **Data Layer**: SQLAlchemy models and database operations
- **Priority Engine**: Custom priority queue algorithms

### Frontend Architecture
- **React Components**: UI components and state management
- **API Integration**: HTTP client for backend communication
- **State Management**: React hooks for local state (can be extended with Redux/Zustand)

## Database Schema

- **Tasks Table**: Core task entity with priority metadata
- **Future**: Analytics tables, ML model predictions, user preferences

## API Design

RESTful API with the following resources:
- `/tasks` - Task CRUD operations
- `/tasks/prioritize` - Reprioritization endpoint

## Priority Queue Engine

Modular algorithm system allowing easy addition of new prioritization strategies:
- Default Algorithm
- Eisenhower Matrix
- Time Decay Algorithm
- Future: ML-based algorithms

