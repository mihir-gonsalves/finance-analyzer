# app/api/analytics/time_series.py - routing for all time-based analytics
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from typing import Optional
import datetime

from app.database import SessionLocal
from app.crud import summaries


router = APIRouter(tags=["analytics-time"])


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


@router.get("/weekly")
def get_weekly_breakdown(
    cost_center_id: Optional[int] = Query(None, description="If provided, shows spend categories within cost center"),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get weekly spending breakdown.
    
    - Without cost_center_id: Returns weekly totals by cost center
    - With cost_center_id: Returns weekly totals by spend category within that cost center
    
    Returns:
        {
            "breakdown_by": "spend_category" | "cost_center",
            "cost_center_id": int | null,
            "weekly_totals": {"2024-W01": {"Category": 150.50, ...}, ...}
        }
    """
    try:
        validate_date_range(start, end)
        
        if cost_center_id is not None:
            weekly_data = summaries.get_weekly_totals_by_spend_category_in_cost_center(
                db, cost_center_id, start, end
            )
            breakdown_by = "spend_category"
        else:
            weekly_data = summaries.get_weekly_totals_by_cost_center(db, start, end)
            breakdown_by = "cost_center"
        
        return {
            "breakdown_by": breakdown_by,
            "cost_center_id": cost_center_id,
            "weekly_totals": weekly_data,
            "week_count": len(weekly_data),
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get weekly breakdown: {str(e)}")


@router.get("/monthly")
def get_monthly_breakdown(
    cost_center_id: Optional[int] = Query(None, description="If provided, shows spend categories within cost center"),
    year: Optional[int] = Query(None, ge=2000, le=2100),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get monthly spending breakdown.
    
    - Without cost_center_id: Returns monthly totals by cost center
    - With cost_center_id: Returns monthly totals by spend category within that cost center
    
    Can filter by year OR by start/end dates (not both).
    
    Returns:
        {
            "breakdown_by": "spend_category" | "cost_center",
            "monthly_totals": {"January": {"Category": 450.75, ...}, ...}
        }
    """
    try:
        if year and (start or end):
            raise HTTPException(status_code=400, detail="Cannot specify both year and date range")
        
        validate_date_range(start, end)
        
        if cost_center_id is not None:
            monthly_data = summaries.get_monthly_totals_by_spend_category_in_cost_center(
                db, cost_center_id, year, start, end
            )
            breakdown_by = "spend_category"
        else:
            monthly_data = summaries.get_monthly_totals_by_cost_center(db, year, start, end)
            breakdown_by = "cost_center"
        
        return {
            "breakdown_by": breakdown_by,
            "cost_center_id": cost_center_id,
            "monthly_totals": monthly_data,
            "month_count": len(monthly_data),
            "year": year,
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get monthly breakdown: {str(e)}")


@router.get("/monthly/simple")
def get_simple_monthly_totals(
    year: Optional[int] = Query(None, ge=1990, le=2050),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get simple monthly totals (not grouped by cost center or category).
    
    Returns:
        {
            "monthly_totals": {"January": 1234.56, ...}
        }
    """
    try:
        if year and (start or end):
            raise HTTPException(status_code=400, detail="Cannot specify both year and date range")
        
        validate_date_range(start, end)
        
        monthly_data = summaries.get_monthly_totals(db, year, start, end)
        
        return {
            "monthly_totals": monthly_data,
            "total": sum(monthly_data.values()),
            "year": year,
            "date_range": {"start": start, "end": end} if start or end else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get monthly totals")
