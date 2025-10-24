## Project Overview

This is a personal budget analyzer built with a FastAPI backend and React frontend. Users can upload CSV files from their bank/credit card accounts to analyze their transactions. 

Note: This is not meant to be a net worth calculator. This is only to help users create budgets and manage cash.


## Budgeting Guide

- Todo


## Cost Centers and Spend Categories

### Cost Center
Spend Category 1, Spend Category 2, Spend Category 3, etc.

### Car
Lease/financing payments, gas, insurance, maintenance, etc.

### Meals
Groceries, restaurants, drinks, etc.

### Living Expenses
Rent, utilities, maintenance, insurance, etc.

### Savings (treated as an expense because you shouldn't touch this)
IRA savings, 401(k), crypto, emergency fund, etc.

### Travel
Ubers, non-vacation flights, parking, subway fees, etc.

### Media
Streaming subscriptions, video game purchases, movies (including movie tickets), etc.

### Entertainment
Other entertainment like mini-golf, nightlife, drinks, theatre, concerts, etc.

### Events
Weddings, conferences, other special events, etc.

### Tools & Productivity
GenAI credits/subscriptions, VPN subscriptions, domain subscriptions, etc.

### Business
Work-related travel, tools, software, subscriptions, supplies, reimbursables, etc.

### Gifts
Flowers, holiday gifts, birthday gifts, etc.

### Tech
New phone, laptop, headphones, pc upgrades, consoles, etc.

### Vacations
Destination travel, transportation during vacation, lodging, meals, etc.

### Self-Care
Skincare, supplements, gym membership, spa, etc.

### Health
Doctor visits, prescriptions, dental, vision, etc.

### Home Improvements
Furniture, appliances, kitchenware, decor, cleaning equipment (e.g. vacuum), etc.

### Home Essentials
Cleaning supplies, laundry supplies, light bulbs, batteries, etc.

### Fashion
Clothes, shoes, haircuts, cologne, makeup, accessories (e.g. wallets), etc.

### Education
Books, courses, certification fees, etc.

### Fees
Bank fees, credit card interest, late fees, etc.

### Pets
Food, vet visits, grooming, etc.

### Childcare
Daycare, school tuition, supplies, toys, activities, etc.

### Charity
Donations, fundraising, etc.

### Misc.
Arbitrary items that don't fit in the buckets above


## Key Design Decisions

- **Todo**
- **Local-first**: Manually upload CSV files rather than connecting to bank APIs
- **SQLite**: Simple file-based database suitable for personal use
- **Standardized transaction format**: All bank CSV formats parsed into consistent Transaction model
- **Category field optional**: Some banks don't provide categories, users can add manually


## Architecture

### Backend (Python/FastAPI)
- **FastAPI** REST API with CORS enabled for frontend communication
- **SQLite** database with **SQLAlchemy** ORM for persistence
- **Pydantic** schemas for request/response validation
- **Uvicorn** ASGI web server - runs the backend
- **Pytest** tests core python modules
- Modular structure: parsers → loaders → database → API endpoints

Core modules:
- `app/models.py`: SQLAlchemy Transaction model
- `app/parsers.py`: CSV parsing logic for different bank formats
- `app/loaders.py`: Data loading functions to move parsed data into database
- `app/crud/summaries.py` - sets up the R in CRUD for enhanced summaries
- `app/crud/filtering.py`: sets up the R in CRUD for enhanced filtering functions
- `app/crud/totals.py` - sets up the R in CRUD for enhanced totaling functions
- `app/crud/crud.py`: Create, Update, Delete operations
- `app/database.py`: Database connection and initialization
- `app/schemas.py`: Pydantic models for API validation
- `app/api/transactions/*.py`: Transaction CRUD and filtering FastAPI endpoints
- `app/api/analytics/*.py`: Analytics and reporting FastAPI endpoints


### Frontend (React/TypeScript)
- **React 19** with **TypeScript** for type safety
- **Vite** as build tool and development server
- **Material UI (MUI)** for UI components, including data grids and dialogs
- **React Query (@tanstack/react-query)** for server state management
- **Axios** for HTTP client communication with backend

Core modules:
- `frontend/src/App.tsx`: root component with QueryClientProvider, ThemeProvider, Header, and Dashboard
- `frontend/src/types/filters.ts` - defines the types of transaction filters available
- `frontend/src/utils/filterValidation.ts` - validates filter inputs (date ranges, amount ranges) before applying
- `frontend/src/utils/filterUtils.ts` - filter operations (equality checks, URL param building, active filter counting)
- `frontend/src/utils/dateUtils.ts` - date parsing, formatting, and manipulation utilities
- `frontend/src/utils/analyticsUtils.ts` - client-side analytics calculations (totals, grouping, formatting, chart data prep)
- `frontend/src/hooks/useTransactions.ts` - transaction CRUD operations and metadata queries (cost centers, spend categories, accounts)
- `frontend/src/hooks/useSpendingAnalytics.ts` - quick client-side analytics calculations on already-fetched transactions
- `frontend/src/hooks/usePendingFilters.ts` - manages unsaved filter state before applying to avoid unnecessary API calls
- `frontend/src/hooks/useFilters.ts` - smart hook that switches between all/filtered transactions based on active filters
- `frontend/src/hooks/useFilterOptions.ts` - fetches and prepares filter dropdown options from backend metadata
- `frontend/src/hooks/useCSVUpload.ts` - handles CSV file uploads with institution selection
- `frontend/src/hooks/useAnalytics.ts` - fetches analytics from backend API (totals, trends, time-series, top spending)
- `frontend/src/context/TransactionContext.tsx` - react context providing filter state and whether filters are applied globally
- `frontend/src/components/Header.tsx` - app header with title and navigation
- `frontend/src/components/TransactionTable.tsx` - main transaction display (toggles between data grid and chart)
- `frontend/src/components/LedgerChart.tsx` - trading View lightweight chart visualization of transaction history
- `frontend/src/components/FiltersPanel.tsx` - filter controls for transactions (dates, categories, amounts, search)
- `frontend/src/components/AnalyticsPanel.tsx` - dashboard analytics (pie charts, top categories, stats)
- `frontend/src/components/transactions/TransactionDataGrid.tsx` - MUI DataGrid ledger showing transaction rows
- `frontend/src/components/transactions/TransactionTableHeader.tsx` - active filter tags and action buttons (add, upload, export)
- `frontend/src/components/transactions/FilterTags.tsx` - displays active filters as removable chips
- `frontend/src/components/analytics/TopCategoriesList.tsx` - list of top spending categories with amounts
- `frontend/src/components/analytics/SpendingOverview.tsx` - high-level spending summary cards
- `frontend/src/components/analytics/QuickStatsView.tsx` - quick statistics (count, averages, totals)
- `frontend/src/components/analytics/CategoryPieChart.tsx` - pie chart showing spending by category/cost center


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


## Testing

- Tests are located in `/tests` directory
- Uses pytest with configuration in `pytest.ini`
- Backend has comprehensive test coverage for all modules
- Test database is created fresh for each test session via fixtures in `conftest.py`
