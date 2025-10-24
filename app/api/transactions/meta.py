# app/api/transactions/meta.py - routing for supporting resources
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Form, Query
from sqlalchemy.orm import Session

from typing import Optional, List
import datetime
import tempfile

from app import schemas
from app.crud import crud, filtering, summaries
from app.database import SessionLocal
from app.parsers import parse_csv
from app.loaders import save_transactions


router = APIRouter(prefix="/meta", tags=["transaction-meta"])


# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------
# BULK UPLOAD
# -----------------------


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


# -----------------------
# COST CENTER ENDPOINTS
# -----------------------


@router.get("/cost_centers", response_model=schemas.CostCenterListResponse)
def get_all_cost_centers(db: Session = Depends(get_db)):
    """Get all cost centers."""
    try:
        cost_centers = filtering.get_all_cost_centers(db)
        return {
            "cost_centers": cost_centers,
            "count": len(cost_centers)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve cost centers")


@router.get("/cost_centers/{cost_center_id}", response_model=schemas.CostCenterWithID)
def get_cost_center(
    cost_center_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific cost center by ID."""
    try:
        cost_center = filtering.get_cost_center_by_id(db, cost_center_id)
        if not cost_center:
            raise HTTPException(status_code=404, detail="Cost center not found")
        return cost_center
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve cost center")


@router.post("/cost_centers", response_model=schemas.CostCenterWithID)
def create_cost_center(
    cost_center: schemas.CostCenterCreate,
    db: Session = Depends(get_db)
):
    """Create a new cost center."""
    try:
        return crud.create_cost_center(db, cost_center)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create cost center")


@router.delete("/cost_centers/{cost_center_id}")
def delete_cost_center(
    cost_center_id: int,
    cascade: bool = Query(False, description="Delete even if transactions exist (sets them to NULL)"),
    db: Session = Depends(get_db)
):
    """
    Delete a cost center.
    By default, only deletes if no transactions use it.
    With cascade=true, deletes and sets transaction cost_center_id to NULL.
    """
    try:
        deleted = crud.delete_cost_center(db, cost_center_id, cascade=cascade)
        if not deleted:
            raise HTTPException(
                status_code=400,
                detail="Cost center not found or has transactions (use cascade=true to force delete)"
            )
        return {"message": "Cost center deleted successfully", "id": cost_center_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete cost center")


# -----------------------
# SPEND CATEGORY ENDPOINTS
# -----------------------


@router.get("/spend_categories", response_model=schemas.SpendCategoryListResponse)
def get_all_spend_categories(db: Session = Depends(get_db)):
    """Get all spend categories."""
    try:
        spend_categories = filtering.get_all_spend_categories(db)
        return {
            "spend_categories": spend_categories,
            "count": len(spend_categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve spend categories")


@router.get("/spend_categories/{spend_category_id}", response_model=schemas.SpendCategoryWithID)
def get_spend_category(
    spend_category_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific spend category by ID."""
    try:
        category = filtering.get_spend_category_by_id(db, spend_category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Spend category not found")
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve spend category")


@router.post("/spend_categories", response_model=schemas.SpendCategoryWithID)
def create_spend_category(
    category: schemas.SpendCategoryCreate,
    db: Session = Depends(get_db)
):
    """Create a new spend category."""
    try:
        return crud.create_spend_category(db, category)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create spend category")


@router.delete("/spend_categories/{spend_category_id}")
def delete_spend_category(
    spend_category_id: int,
    db: Session = Depends(get_db)
):
    """Delete a spend category. Only succeeds if not used by any transactions."""
    try:
        deleted = crud.delete_spend_category(db, spend_category_id)
        if not deleted:
            raise HTTPException(
                status_code=400,
                detail="Spend category not found or is still in use by transactions"
            )
        return {"message": "Spend category deleted successfully", "id": spend_category_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete spend category")


# -----------------------
# METADATA ENDPOINTS
# -----------------------


@router.get("/metadata/accounts", response_model=List[str])
def get_unique_accounts(db: Session = Depends(get_db)):
    """Get list of all unique account names."""
    try:
        return summaries.get_unique_accounts(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve accounts")


@router.get("/metadata/date-range")
def get_date_range(db: Session = Depends(get_db)):
    """Get the earliest and latest transaction dates."""
    try:
        min_date, max_date = summaries.get_date_range(db)
        return {
            "earliest": min_date,
            "latest": max_date,
            "has_data": min_date is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve date range")


@router.get("/metadata/stats")
def get_transaction_stats(
    account: Optional[str] = Query(None),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get transaction statistics, optionally filtered."""
    try:
        total_count = summaries.get_transaction_count(db, account, start, end)
        account_summary = summaries.get_account_summary(db, start, end)
        
        return {
            "total_transactions": total_count,
            "accounts": [
                {"name": acc, "total": float(total), "count": count}
                for acc, total, count in account_summary
            ],
            "filters": {
                "account": account,
                "start": start,
                "end": end
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve stats")
