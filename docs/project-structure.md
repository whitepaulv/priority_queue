# Project Structure

Complete folder tree for PriorityForge project.

```
priority_forge/
├── README.md                          # Project main documentation
├── .gitignore                         # Git ignore rules
│
├── backend/                           # Python FastAPI backend
│   ├── __init__.py
│   ├── main.py                        # FastAPI app entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .gitignore                     # Backend-specific gitignore
│   │
│   ├── api/                           # API layer
│   │   ├── __init__.py
│   │   ├── routes.py                  # API route definitions
│   │   ├── schemas.py                 # Pydantic request/response schemas
│   │   └── dependencies.py            # Dependency injection utilities
│   │
│   ├── database/                      # Database layer
│   │   ├── __init__.py
│   │   ├── connection.py              # Database engine and connection
│   │   └── session.py                 # Session management
│   │
│   ├── models/                        # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py                    # Base model class
│   │   └── task.py                    # Task model
│   │
│   ├── priority_queue/                # Priority queue engine
│   │   ├── __init__.py
│   │   ├── engine.py                  # Priority queue engine
│   │   └── algorithms.py              # Priority algorithms
│   │
│   ├── services/                      # Business logic layer
│   │   ├── __init__.py
│   │   └── task_service.py            # Task business logic
│   │
│   └── tests/                         # Test suite
│       ├── __init__.py
│       ├── test_api.py                # API endpoint tests
│       └── test_priority_queue.py     # Priority queue tests
│
├── frontend/                          # React frontend (Vite)
│   ├── package.json                   # Node.js dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── .gitignore                     # Frontend-specific gitignore
│   │
│   ├── src/                           # Source code
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.jsx                    # Main app component
│   │   ├── App.css                    # App styles
│   │   └── index.css                  # Global styles
│   │
│   └── public/                        # Static assets
│       └── index.html                 # HTML template
│
├── docs/                              # Documentation
│   ├── README.md                      # Documentation index
│   ├── architecture.md                # Architecture overview
│   ├── api.md                         # API documentation
│   ├── algorithms.md                  # Priority algorithms docs
│   ├── deployment.md                  # Deployment guide
│   ├── future-features.md             # Future roadmap
│   └── project-structure.md           # This file
│
└── scripts/                           # Utility scripts
    ├── init_db.py                     # Database initialization script
    └── setup_dev.sh                   # Development environment setup
```

## Future Extensions

The following directories can be added for future features:

```
backend/
├── analytics/                         # Analytics module (future)
│   ├── __init__.py
│   ├── collectors.py
│   └── processors.py
│
├── ml/                                # Machine learning module (future)
│   ├── __init__.py
│   ├── models.py
│   └── training.py
│
└── utils/                             # Utility functions (future)
    ├── __init__.py
    └── helpers.py
```

