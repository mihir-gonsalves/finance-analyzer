# app/api/analytics/core.py - routing for general analytics
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from typing import Optional, List
import datetime

from app.database import SessionLocal
from app.crud import summaries, totals


router = APIRouter(tags=["analytics-core"])


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


# -----------------------
# TOP SPENDING ANALYSIS
# -----------------------


@router.get("/top")
def get_top_spending(
    by: str = Query("spend_category", regex="^(spend_category|cost_center)$"),
    limit: int = Query(10, ge=1, le=50),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get top spending categories or cost centers.
    
    Returns top N items sorted by total spending (highest first).
    
    Returns:
        {
            "by": "spend_category" | "cost_center",
            "limit": int,
            "top_items": [{"name": "...", "total": 123.45}, ...]
        }
    """
    try:
        validate_date_range(start, end)
        
        by_cost_center = (by == "cost_center")
        top_items = summaries.get_top_spending_categories(
            db, limit=limit, by_cost_center=by_cost_center, start=start, end=end
        )
        
        return {
            "by": by,
            "limit": limit,
            "top_items": [{"name": name, "total": total} for name, total in top_items],
            "count": len(top_items),
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get top spending")


# -----------------------
# SEARCH-BASED ANALYTICS
# -----------------------


@router.get("/search")
def get_search_analytics(
    search: str = Query(..., min_length=1, description="Search term in transaction descriptions"),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get total spending for transactions matching a search term.
    
    Useful for analyzing spending at specific merchants or categories.
    Example: search="starbucks" to see total Starbucks spending.
    
    Returns:
        {
            "search": "starbucks",
            "total": 123.45,
            "date_range": {...}
        }
    """
    try:
        validate_date_range(start, end)
        
        total = summaries.get_total_by_search_keyword(db, search, start, end)
        
        return {
            "search": search,
            "total": total,
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get search analytics")


# -----------------------
# ACCOUNT ANALYTICS
# -----------------------


@router.get("/accounts/summary")
def get_account_summary(
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get summary statistics for all accounts.
    
    Returns:
        {
            "accounts": [
                {"name": "Chase Credit", "total": 1234.56, "count": 45},
                ...
            ]
        }
    """
    try:
        validate_date_range(start, end)
        
        account_data = summaries.get_account_summary(db, start, end)
        
        return {
            "accounts": [
                {"name": acc, "total": float(total), "count": count}
                for acc, total, count in account_data
            ],
            "total_accounts": len(account_data),
            "grand_total": sum(total for _, total, _ in account_data),
            "total_transactions": sum(count for _, _, count in account_data),
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get account summary")


# -----------------------
# TOTALS BY DIMENSION
# -----------------------


@router.get("/totals")
def get_totals_by_dimension(
    group_by: str = Query("cost_center", regex="^(cost_center|spend_category|account)$"),
    cost_center_ids: Optional[List[int]] = Query(None),
    spend_category_ids: Optional[List[int]] = Query(None),
    accounts: Optional[List[str]] = Query(None),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get spending totals grouped by cost_center, spend_category, or account.
    
    Supports drill-down analysis:
    - Filter by cost_center → see breakdown by spend_category
    - Filter by spend_category → see breakdown by cost_center
    - Filter by account → see breakdown by either dimension
    
    Returns:
        {
            "group_by": "cost_center" | "spend_category" | "account",
            "totals": {"name": amount, ...},
            "grand_total": total_amount,
            "filters_applied": {...}
        }
    """
    try:
        validate_date_range(start, end)
        validate_amount_range(min_amount, max_amount)
        
        # Get totals based on grouping dimension
        if group_by == "spend_category":
            result = totals.get_filtered_totals_by_spend_category(
                db,
                cost_center_ids=cost_center_ids,
                account=accounts,
                start=start,
                end=end,
                min_amount=min_amount,
                max_amount=max_amount,
                search=search
            )
        elif group_by == "cost_center":
            result = totals.get_filtered_totals_by_cost_center(
                db,
                spend_category_ids=spend_category_ids,
                account=accounts,
                start=start,
                end=end,
                min_amount=min_amount,
                max_amount=max_amount,
                search=search
            )
        elif group_by == "account":
            result = totals.get_filtered_totals_by_account(
                db,
                spend_category_ids=spend_category_ids,
                cost_center_ids=cost_center_ids,
                start=start,
                end=end,
                min_amount=min_amount,
                max_amount=max_amount,
                search=search
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid group_by parameter")
        
        return {
            "group_by": group_by,
            "totals": result,
            "grand_total": sum(result.values()),
            "count": len(result),
            "filters_applied": {
                "cost_center_ids": cost_center_ids,
                "spend_category_ids": spend_category_ids,
                "accounts": accounts,
                "date_range": {"start": start, "end": end} if start or end else None,
                "amount_range": {"min": min_amount, "max": max_amount} if min_amount is not None or max_amount is not None else None,
                "search": search
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get totals: {str(e)}")


@router.get("/totals/comprehensive")
def get_comprehensive_totals(
    cost_center_ids: Optional[List[int]] = Query(None),
    spend_category_ids: Optional[List[int]] = Query(None),
    accounts: Optional[List[str]] = Query(None),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive analytics with all three breakdowns.
    Useful for dashboard views showing multiple perspectives at once.
    
    Returns:
        {
            "by_cost_center": {...},
            "by_spend_category": {...},
            "by_account": {...},
            "totals": {...}
        }
    """
    try:
        validate_date_range(start, end)
        validate_amount_range(min_amount, max_amount)
        
        by_cost_center = totals.get_filtered_totals_by_cost_center(
            db, spend_category_ids, accounts, start, end, min_amount, max_amount, search
        )
        
        by_spend_category = totals.get_filtered_totals_by_spend_category(
            db, cost_center_ids, accounts, start, end, min_amount, max_amount, search
        )
        
        by_account = totals.get_filtered_totals_by_account(
            db, spend_category_ids, cost_center_ids, start, end, min_amount, max_amount, search
        )
        
        return {
            "by_cost_center": by_cost_center,
            "by_spend_category": by_spend_category,
            "by_account": by_account,
            "totals": {
                "cost_center_total": sum(by_cost_center.values()),
                "spend_category_total": sum(by_spend_category.values()),
                "account_total": sum(by_account.values())
            },
            "filters_applied": {
                "cost_center_ids": cost_center_ids,
                "spend_category_ids": spend_category_ids,
                "accounts": accounts,
                "date_range": {"start": start, "end": end} if start or end else None,
                "amount_range": {"min": min_amount, "max": max_amount} if min_amount is not None or max_amount is not None else None,
                "search": search
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get comprehensive totals: {str(e)}")


# -----------------------
# SPECIFIC TOTALS
# -----------------------


@router.get("/totals/cost_center/{cost_center_id}")
def get_cost_center_total(
    cost_center_id: int,
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get total spending for a specific cost center."""
    try:
        validate_date_range(start, end)
        total = totals.get_total_spent_by_cost_center(db, cost_center_id, start, end)
        return {
            "cost_center_id": cost_center_id,
            "total": total,
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get cost center total")


@router.get("/totals/spend_category/{spend_category_id}")
def get_spend_category_total(
    spend_category_id: int,
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get total spending for a specific spend category."""
    try:
        validate_date_range(start, end)
        total = totals.get_total_spent_by_spend_category(db, spend_category_id, start, end)
        return {
            "spend_category_id": spend_category_id,
            "total": total,
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get spend category total")
