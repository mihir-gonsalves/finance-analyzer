# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal finance analyzer built with a FastAPI backend and React frontend. Users can upload CSV files from their bank/credit card accounts to analyze their transactions. The application follows Test-Driven Development practices.

## Architecture

### Backend (Python/FastAPI)
- **FastAPI** REST API with CORS enabled for frontend communication
- **SQLite** database with **SQLAlchemy** ORM for persistence
- **Pydantic** schemas for request/response validation
- Modular structure: parsers → loaders → database → API endpoints

Core modules:
- `app/models.py`: SQLAlchemy Transaction model
- `app/parsers.py`: CSV parsing logic for different bank formats
- `app/loaders.py`: Data loading functions to move parsed data into database
- `app/queries.py`: Query functions for retrieving/filtering transactions
- `app/crud.py`: Create, Update, Delete operations
- `app/api/transactions.py`: FastAPI endpoints
- `app/database.py`: Database connection and initialization
- `app/schemas.py`: Pydantic models for API validation

### Frontend (React/TypeScript)
- **React 19** with **TypeScript** for type safety
- **Vite** as build tool and development server
- **Material UI (MUI)** for UI components, including data grids and dialogs
- **React Query (@tanstack/react-query)** for server state management
- **Axios** for HTTP client communication with backend

## Commands

### Backend Development
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI development server
uvicorn app.main:app --reload

# Run tests
pytest

# Run specific test file
pytest tests/test_api.py

# Run tests with verbose output
pytest -v
```

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server (starts on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Development Workflow

1. **Backend-first approach**: Core functionality implemented in backend with comprehensive tests
2. **CSV parsing**: Different banks have different CSV formats, parsers handle standardization
3. **Database operations**: Use existing CRUD functions rather than direct SQL
4. **API endpoints**: Follow REST conventions, all endpoints are in `app/api/transactions.py`
5. **Frontend integration**: Components use React Query for data fetching and caching

## Testing

- Tests are located in `/tests` directory
- Uses pytest with configuration in `pytest.ini`
- Backend has comprehensive test coverage for all modules
- Test database is created fresh for each test session via fixtures in `conftest.py`

## Key Design Decisions

- **Offline-first**: Users manually upload CSV files rather than connecting to bank APIs (avoids regulatory compliance)
- **SQLite**: Simple file-based database suitable for personal use
- **Standardized transaction format**: All bank CSV formats parsed into consistent Transaction model
- **CORS configured**: Frontend (localhost:5173) can communicate with backend
- **Category field optional**: Some banks don't provide categories, users can add manually