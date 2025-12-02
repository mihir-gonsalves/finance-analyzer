# app/api/transactions.py - backend api endpoints for transaction crud, filtering, etc.
from fastapi import APIRouter, UploadFile, HTTPException, Depends, Query, Form

from sqlalchemy.orm import Session

from typing import Optional, List
import datetime
import tempfile

from app import schemas
from app.crud import operations
from app.database import SessionLocal
from app.parsers import parse_csv
from app.loaders import save_transactions


router = APIRouter(prefix="/transactions", tags=["transactions"])


# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================
# CRUD OPERATIONS
# ============================================


@router.post("/", response_model=schemas.TransactionWithID)
def create_transaction(txn: schemas.TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction."""
    return operations.create_transaction(db, txn)


@router.get("/", response_model=schemas.TransactionListResponse)
def get_all_transactions(db: Session = Depends(get_db)):
    """Get all transactions without filters."""
    transactions = operations.get_transactions(session=db)
    return {
        "transactions": transactions,
        "count": len(transactions),
    }


@router.put("/{txn_id}", response_model=schemas.TransactionWithID)
def update_transaction(txn_id: int, txn: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    """Update an existing transaction."""
    updated = operations.update_transaction(db, txn_id, txn)
    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return updated


@router.delete("/{txn_id}")
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    """Delete a transaction."""
    deleted = operations.delete_transaction(db, txn_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted", "id": txn_id}


# ============================================
# FILTERING
# ============================================


@router.get("/filter", response_model=schemas.TransactionListResponse)
def filter_transactions(
    # Text search
    search: Optional[str] = Query(None),

    # Categorical filters
    cost_center_ids: Optional[List[int]] = Query(None),
    spend_category_ids: Optional[List[int]] = Query(None),
    account: Optional[List[str]] = Query(None),
    
    # Date range
    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),
    
    # Amount range
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    
    db: Session = Depends(get_db),
):
    """
    Filter transactions with flexible criteria.
    Frontend will compute all analytics from this response.
    """
    transactions = operations.get_transactions(
        session = db,
        search = search,
        cost_center_ids = cost_center_ids,
        spend_category_ids = spend_category_ids,
        account = account,
        start_date = start_date,
        end_date = end_date,
        min_amount = min_amount,
        max_amount = max_amount,
    )
    
    return {
        "transactions": transactions,
        "count": len(transactions),
    }


# ============================================
# METADATA - Dropdown Options
# ============================================


@router.get("/cost_centers", response_model=schemas.CostCenterListResponse)
def get_cost_centers(db: Session = Depends(get_db)):
    """Get all cost centers for filter dropdowns."""
    cost_centers = operations.get_all_cost_centers(db)
    return {"cost_centers": cost_centers, "count": len(cost_centers)}


@router.get("/spend_categories", response_model=schemas.SpendCategoryListResponse)
def get_spend_categories(db: Session = Depends(get_db)):
    """Get all spend categories for filter dropdowns."""
    categories = operations.get_all_spend_categories(db)
    return {"spend_categories": categories, "count": len(categories)}


@router.get("/accounts", response_model=List[str])
def get_accounts(db: Session = Depends(get_db)):
    """Get all unique account names for filter dropdowns."""
    return operations.get_unique_accounts(db)


# ============================================
# BULK OPERATIONS (CSV Upload)
# ============================================


@router.post("/upload-csv")
async def upload_csv(
    institution: str = Form(..., description="Institution name (e.g., 'discover', 'schwab')"),
    file: UploadFile = Form(...),
    db: Session = Depends(get_db),
):
    """
    Upload and parse a CSV file from a financial institution.
    Automatically saves transactions to database.
    
    Maximum file size: 10MB
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    # Read and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB"
        )
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        transactions = parse_csv(tmp_path, institution)
        save_transactions(transactions, db)
        return {
            "message": f"Successfully loaded {len(transactions)} transactions",
            "count": len(transactions),
            "institution": institution
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")
