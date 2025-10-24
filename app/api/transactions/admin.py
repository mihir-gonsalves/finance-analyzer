# app/api/transactions/admin.py - routing for admin or bulk-style operations
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from typing import Optional, List
import datetime
import csv
import io
import json

from app import schemas
from app.crud import crud, filtering
from app.database import SessionLocal


router = APIRouter(prefix="/admin", tags=["transaction-admin"])


# Constants
EXPORT_FORMATS = ["csv", "json"]


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


@router.post("/bulk-update", response_model=schemas.BulkUpdateResult)
def bulk_update_transactions(
    request: schemas.BulkUpdateRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Update multiple transactions at once with the same update data.
    Useful for bulk re-categorization or corrections.
    """
    try:
        results = {"updated": [], "failed": []}
        
        for txn_id in request.transaction_ids:
            try:
                updated = crud.update_transaction(db, txn_id, request.update_data, auto_cleanup=True)
                if updated:
                    results["updated"].append(txn_id)
                else:
                    results["failed"].append({
                        "id": txn_id, 
                        "reason": "Transaction not found"
                    })
            except ValueError as e:
                results["failed"].append({
                    "id": txn_id, 
                    "reason": f"Validation error: {str(e)}"
                })
            except Exception as e:
                results["failed"].append({
                    "id": txn_id, 
                    "reason": f"Update failed: {str(e)}"
                })
        
        return schemas.BulkUpdateResult(
            updated=results["updated"],
            failed=results["failed"],
            total_requested=len(request.transaction_ids),
            total_updated=len(results["updated"]),
            total_failed=len(results["failed"])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk update failed: {str(e)}")


@router.post("/bulk-delete", response_model=schemas.BulkDeleteResult)
def bulk_delete_transactions(
    request: schemas.BulkDeleteRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Delete multiple transactions at once.
    Automatically cleans up orphaned categories and cost centers.
    """
    try:
        results = {"deleted": [], "failed": []}
        
        for txn_id in request.transaction_ids:
            try:
                deleted = crud.delete_transaction(db, txn_id, auto_cleanup=True)
                if deleted:
                    results["deleted"].append(txn_id)
                else:
                    results["failed"].append({
                        "id": txn_id, 
                        "reason": "Transaction not found"
                    })
            except Exception as e:
                results["failed"].append({
                    "id": txn_id, 
                    "reason": f"Delete failed: {str(e)}"
                })
        
        return schemas.BulkDeleteResult(
            deleted=results["deleted"],
            failed=results["failed"],
            total_requested=len(request.transaction_ids),
            total_deleted=len(results["deleted"]),
            total_failed=len(results["failed"])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk delete failed: {str(e)}")


@router.get("/export")
def export_transactions(
    format: str = Query("csv", description="Export format (csv or json)"),
    account: Optional[List[str]] = Query(None),
    spend_category_ids: Optional[List[int]] = Query(None),
    cost_center_ids: Optional[List[int]] = Query(None),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    include_uncategorized_categories: bool = Query(False),
    include_uncategorized_cost_centers: bool = Query(False),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """
    Export filtered transactions in CSV or JSON format.
    Applies the same filters as the /filter endpoint.
    """
    try:
        # Validation
        validate_date_range(start, end)
        validate_amount_range(min_amount, max_amount)
        
        if format not in EXPORT_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid format. Must be one of: {', '.join(EXPORT_FORMATS)}"
            )
        
        # Get filtered transactions (no limit for export)
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
            limit=None,
            offset=None
        )
        
        if format == "csv":
            # Generate CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Header
            writer.writerow([
                'ID', 'Date', 'Description', 'Amount', 'Account', 
                'Cost Center', 'Spend Categories'
            ])
            
            # Data rows
            for txn in transactions:
                cost_center = txn.cost_center.name if txn.cost_center else "Uncategorized"
                spend_cats = ", ".join([cat.name for cat in txn.spend_categories]) if txn.spend_categories else "Uncategorized"
                
                writer.writerow([
                    txn.id,
                    txn.date.isoformat(),
                    txn.description,
                    txn.amount,
                    txn.account,
                    cost_center,
                    spend_cats
                ])
            
            output.seek(0)
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"transactions_{timestamp}.csv"
            
            return StreamingResponse(
                iter([output.getvalue()]),
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        
        elif format == "json":
            # Generate JSON
            data = []
            for txn in transactions:
                data.append({
                    "id": txn.id,
                    "date": txn.date.isoformat(),
                    "description": txn.description,
                    "amount": txn.amount,
                    "account": txn.account,
                    "cost_center": {
                        "id": txn.cost_center.id,
                        "name": txn.cost_center.name
                    } if txn.cost_center else None,
                    "spend_categories": [
                        {"id": cat.id, "name": cat.name} 
                        for cat in txn.spend_categories
                    ] if txn.spend_categories else []
                })
            
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"transactions_{timestamp}.json"
            
            json_str = json.dumps({"transactions": data, "count": len(data)}, indent=2)
            
            return StreamingResponse(
                iter([json_str]),
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@router.post("/maintenance/cleanup")
def cleanup_orphaned_items(db: Session = Depends(get_db)):
    """Remove all orphaned spend categories and cost centers."""
    try:
        results = crud.cleanup_all_orphaned(db)
        return {
            "message": "Cleanup completed successfully",
            "spend_categories_deleted": results["spend_categories_deleted"],
            "cost_centers_deleted": results["cost_centers_deleted"],
            "total_deleted": results["total_deleted"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Cleanup failed")


@router.post("/maintenance/cleanup-spend-categories")
def cleanup_orphaned_spend_categories(db: Session = Depends(get_db)):
    """Remove unused spend categories."""
    try:
        count = crud.cleanup_orphaned_spend_categories(db)
        return {
            "message": f"Deleted {count} unused spend categories",
            "count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Cleanup failed")


@router.post("/maintenance/cleanup-cost-centers")
def cleanup_orphaned_cost_centers(db: Session = Depends(get_db)):
    """Remove cost centers with no transactions."""
    try:
        count = crud.cleanup_orphaned_cost_centers(db)
        return {
            "message": f"Deleted {count} unused cost centers",
            "count": count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Cleanup failed")
