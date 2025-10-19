# app/api/transactions.py - sets up FastAPI endpoints
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, Query

import datetime
import tempfile
from typing import Optional, List

from app import crud, queries, schemas
from app.database import SessionLocal
from app.parsers import parse_csv
from app.loaders import save_transactions


router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)


# Dependency: provide a session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------
# CREATE, UPDATE, DELETE endpoints (crud.py)
# ---------------------
@router.post("/", response_model=schemas.TransactionWithCategories)
def create_transaction(
    txn: schemas.TransactionCreate, 
    db: Session = Depends(get_db)
):
    """Create a new transaction."""
    try:
        return crud.create_transaction(db, txn)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create transaction")


@router.put("/{txn_id}", response_model=schemas.TransactionWithCategories)
def update_transaction(
    txn_id: int, 
    txn: schemas.TransactionUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing transaction."""
    try:
        updated = crud.update_transaction(db, txn_id, txn)
        if not updated:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update transaction")


@router.delete("/{txn_id}", response_model=dict)
def delete_transaction(
    txn_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a transaction."""
    try:
        deleted = crud.delete_transaction(db, txn_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return {"message": "Transaction deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete transaction")


# ---------------------
# READ endpoints (queries.py)
# ---------------------
@router.get("/", response_model=list[schemas.TransactionWithCategories])
def read_transactions(db: Session = Depends(get_db)):
    """Get all transactions without any filters."""
    try:
        return queries.get_all_transactions(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve transactions")


@router.get("/filter", response_model=list[schemas.TransactionWithCategories])
def read_filtered_transactions(
    account: Optional[List[str]] = Query(None, description="Filter by account(s)"),
    category: Optional[List[str]] = Query(None, description="Filter by category/categories"),
    start: Optional[datetime.date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[datetime.date] = Query(None, description="End date (YYYY-MM-DD)"),
    minAmount: Optional[float] = Query(None, ge=0, description="Minimum amount"),
    maxAmount: Optional[float] = Query(None, ge=0, description="Maximum amount"),
    search: Optional[str] = Query(None, min_length=1, description="Search term"),
    db: Session = Depends(get_db),
):
    """
    Filter transactions dynamically with optional criteria.
    All filters can be combined.
    
    Query Parameters:
    - account: One or more account names
    - category: One or more category names (use empty string for uncategorized)
    - start: Start date (inclusive)
    - end: End date (inclusive)
    - minAmount: Minimum transaction amount
    - maxAmount: Maximum transaction amount
    - search: Search term (matches description, account, or category)
    
    Example:
    /transactions/filter?account=Checking&category=Groceries&category=Dining&minAmount=10&maxAmount=100
    """
    try:
        # Validate date range
        if start and end and start > end:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before or equal to end date"
            )
        
        # Validate amount range
        if minAmount is not None and maxAmount is not None and minAmount > maxAmount:
            raise HTTPException(
                status_code=400,
                detail="Minimum amount must be less than or equal to maximum amount"
            )
        
        # Convert single-item lists to single values for cleaner handling
        account_filter = account[0] if account and len(account) == 1 else account
        category_filter = category[0] if category and len(category) == 1 else category
        
        transactions = queries.get_transactions(
            session=db,
            account=account_filter,
            category=category_filter,
            start=start,
            end=end,
            min_amount=minAmount,
            max_amount=maxAmount,
            search=search
        )
        return transactions
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to filter transactions")


@router.get("/accounts", response_model=list[str])
def get_accounts(db: Session = Depends(get_db)):
    """Get all unique account names."""
    try:
        return queries.get_unique_accounts(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve accounts")


@router.get("/categories", response_model=list[str])
def get_categories(db: Session = Depends(get_db)):
    """Get all unique category names."""
    try:
        return queries.get_unique_categories(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")


@router.get("/categories/full", response_model=list[schemas.CategoryWithID])
def get_full_categories(db: Session = Depends(get_db)):
    """Get all categories with their IDs."""
    try:
        return crud.get_all_categories(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve categories")


@router.post("/categories", response_model=schemas.CategoryWithID)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db)
):
    """Create a new category."""
    try:
        return crud.get_or_create_category(db, category.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create category")


@router.delete("/categories/{category_id}", response_model=dict)
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a category if it's not being used by any transactions."""
    try:
        deleted = crud.delete_category(db, category_id)
        if not deleted:
            raise HTTPException(
                status_code=400, 
                detail="Category not found or still in use"
            )
        return {"message": "Category deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete category")


@router.get("/summary")
def get_spending_summary(
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get spending summary grouped by category.
    Optionally filter by date range.
    """
    try:
        if start and end and start > end:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before or equal to end date"
            )
        
        summary = queries.get_spending_summary(db, start=start, end=end)
        return {
            "start_date": start,
            "end_date": end,
            "by_category": summary,
            "total": sum(summary.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve summary")


@router.get("/totals/category/{category}", response_model=float)
def total_by_category(
    category: str, 
    db: Session = Depends(get_db)
):
    """Get total spending for a specific category."""
    try:
        return queries.get_total_spent_by_category(db, category)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve category total")


@router.get("/totals/weekly/{year}", response_model=list[tuple[str, float]])
def weekly_totals(
    year: int, 
    db: Session = Depends(get_db)
):
    """Get spending totals grouped by week for a given year."""
    try:
        return queries.get_weekly_totals(db, year)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve weekly totals")


@router.get("/totals/monthly/{year}", response_model=list[tuple[str, float]])
def monthly_totals(
    year: int, 
    db: Session = Depends(get_db)
):
    """Get spending totals grouped by month for a given year."""
    try:
        return queries.get_monthly_totals(db, year)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve monthly totals")


# -----------------------
# BULK UPLOAD (CSV -> DB)
# -----------------------
@router.post("/upload-csv")
async def upload_csv(
    institution: str = Form(...),
    file: UploadFile = Form(...),
    db: Session = Depends(get_db),
):
    """
    Upload a CSV file from Discover/Schwab, parse it, and save to DB.
    """
    # Save uploaded file to a temp path
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # Parse and save
    try:
        transactions = parse_csv(tmp_path, institution)
        save_transactions(transactions, db)
        return {"message": f"Loaded {len(transactions)} transactions"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to upload CSV")
