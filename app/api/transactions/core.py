# app/api/transactions/core.py - routing for querying or editing transactions
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from typing import Optional, List
import datetime

from app import schemas
from app.crud import crud, filtering, summaries
from app.database import SessionLocal


router = APIRouter(tags=["transactions"])


# Constants
SORT_FIELDS = ["date", "amount", "description", "account"]
SORT_ORDERS = ["asc", "desc"]


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def validate_date_range(start: Optional[datetime.date], end: Optional[datetime.date]):
    """Validate date range parameters."""
    if start and end and start > end:
        raise HTTPException(
            status_code=400, 
            detail="Start date must be before or equal to end date"
        )
    if start and start > datetime.date.today():
        raise HTTPException(status_code=400, detail="Start date cannot be in the future")
    if end and end > datetime.date.today():
        raise HTTPException(status_code=400, detail="End date cannot be in the future")


def validate_amount_range(min_amount: Optional[float], max_amount: Optional[float]):
    """Validate amount range parameters."""
    if min_amount is not None and max_amount is not None and min_amount > max_amount:
        raise HTTPException(
            status_code=400, 
            detail="Minimum amount must be less than or equal to maximum amount"
        )


@router.post("/", response_model=schemas.TransactionWithID)
def create_transaction(
    txn: schemas.TransactionCreate,
    db: Session = Depends(get_db)
):
    """Create a new transaction with optional cost center and spend categories."""
    try:
        return crud.create_transaction(db, txn)
    except ValueError as e:
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "Validation Error",
                "message": str(e),
                "field": "transaction"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create transaction")


@router.get("/", response_model=schemas.TransactionListResponse)
def get_all_transactions(db: Session = Depends(get_db)):
    """Get all transactions without filters."""
    try:
        transactions = filtering.get_all_transactions(db)
        return {
            "transactions": transactions,
            "count": len(transactions),
            "pagination": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve transactions")


@router.get("/filter", response_model=schemas.TransactionListResponse)
def filter_transactions(
    account: Optional[List[str]] = Query(None, description="Filter by account(s)"),
    spend_category_ids: Optional[List[int]] = Query(None, description="Filter by spend category IDs"),
    cost_center_ids: Optional[List[int]] = Query(None, description="Filter by cost center IDs"),
    start: Optional[datetime.date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[datetime.date] = Query(None, description="End date (YYYY-MM-DD)"),
    min_amount: Optional[float] = Query(None, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, description="Maximum amount"),
    search: Optional[str] = Query(None, min_length=1, description="Search in description"),
    include_uncategorized_categories: bool = Query(False, description="Include transactions with no spend categories"),
    include_uncategorized_cost_centers: bool = Query(False, description="Include transactions with no cost center"),
    sort_by: str = Query("date", description="Field to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc/desc)"),
    limit: Optional[int] = Query(None, ge=1, le=1000),
    offset: Optional[int] = Query(None, ge=0),
    db: Session = Depends(get_db),
):
    """
    Filter transactions with multiple optional criteria.
    All filters can be combined. Supports pagination and sorting.
    """
    try:
        # Validation
        validate_date_range(start, end)
        validate_amount_range(min_amount, max_amount)
        
        if sort_by not in SORT_FIELDS:
            raise HTTPException(status_code=400, detail=f"Invalid sort_by field. Must be one of: {', '.join(SORT_FIELDS)}")
        
        if sort_order not in SORT_ORDERS:
            raise HTTPException(status_code=400, detail=f"Invalid sort_order. Must be one of: {', '.join(SORT_ORDERS)}")
        
        # Get total count for pagination
        total_count = summaries.get_transaction_count(
            db,
            account=account[0] if account and len(account) == 1 else None,
            start=start,
            end=end
        )
        
        # Get filtered transactions
        transactions = filtering.get_transactions(
            session=db,
            account=account,
            spend_category_ids=spend_category_ids,
            cost_center_ids=cost_center_ids,
            start=start,
            end=end,
            min_amount=min_amount,
            max_amount=max_amount,
            search=search,
            include_uncategorized_categories=include_uncategorized_categories,
            include_uncategorized_cost_centers=include_uncategorized_cost_centers,
            sort_by=sort_by,
            sort_order=sort_order,
            limit=limit,
            offset=offset
        )
        
        # Build pagination metadata
        pagination = None
        if limit is not None or offset is not None:
            current_offset = offset or 0
            returned = len(transactions)
            pagination = schemas.PaginationMetadata(
                limit=limit,
                offset=current_offset,
                total=total_count,
                returned=returned,
                has_more=(current_offset + returned) < total_count
            )
        
        return {
            "transactions": transactions,
            "count": len(transactions),
            "pagination": pagination
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to filter transactions: {str(e)}")


@router.get("/recent", response_model=schemas.TransactionListResponse)
def get_recent_transactions(
    limit: int = Query(25, ge=1, le=100),
    account: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get most recent transactions, optionally filtered by account."""
    try:
        transactions = filtering.get_recent_transactions(db, limit=limit, account=account)
        return {
            "transactions": transactions,
            "count": len(transactions),
            "pagination": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve recent transactions")


@router.put("/{txn_id}", response_model=schemas.TransactionWithID)
def update_transaction(
    txn_id: int,
    txn: schemas.TransactionUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing transaction. Auto-cleans orphaned categories/cost centers."""
    try:
        updated = crud.update_transaction(db, txn_id, txn, auto_cleanup=True)
        if not updated:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=400, 
            detail={
                "error": "Validation Error",
                "message": str(e),
                "field": "transaction"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update transaction")


@router.delete("/{txn_id}")
def delete_transaction(
    txn_id: int,
    db: Session = Depends(get_db)
):
    """Delete a transaction. Auto-cleans orphaned categories/cost centers."""
    try:
        deleted = crud.delete_transaction(db, txn_id, auto_cleanup=True)
        if not deleted:
            raise HTTPException(status_code=404, detail="Transaction not found")
        return {"message": "Transaction deleted successfully", "id": txn_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete transaction")
