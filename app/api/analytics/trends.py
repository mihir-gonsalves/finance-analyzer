# app/api/analytics/trends.py - routing for trend visualization and dynamic breakdowns
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from typing import Optional, List
import datetime
import calendar
from collections import defaultdict

from app.database import SessionLocal
from app.crud import summaries, filtering as filt


router = APIRouter(tags=["analytics-trends"])


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


@router.get("/trends")
def get_spending_trends(
    group_by: str = Query("month", regex="^(week|month)$", description="Time period grouping"),
    dimension: str = Query("cost_center", regex="^(cost_center|spend_category|total)$", description="What to track"),
    cost_center_ids: Optional[List[int]] = Query(None, description="Filter by cost centers"),
    spend_category_ids: Optional[List[int]] = Query(None, description="Filter by spend categories"),
    accounts: Optional[List[str]] = Query(None, description="Filter by accounts"),
    start: Optional[datetime.date] = Query(None),
    end: Optional[datetime.date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get spending trends over time for visualization (line charts, area charts, etc.).
    
    Returns time-series data showing how spending changes over weeks or months.
    Can be broken down by cost_center, spend_category, or as total spending.
    
    Example use cases:
    - Track monthly spending across all cost centers
    - See weekly spending trends for specific categories
    - Compare spending patterns over time
    
    Returns:
        {
            "group_by": "week" | "month",
            "dimension": "cost_center" | "spend_category" | "total",
            "trends": {
                "2024-W01": {"Meals": 450.50, "Entertainment": 120.00, ...},
                "2024-W02": {...},
                ...
            },
            "series": [
                {"name": "Meals", "data": [450.50, 380.25, ...]},
                {"name": "Entertainment", "data": [120.00, 95.50, ...]},
                ...
            ]
        }
    """
    try:
        validate_date_range(start, end)
        
        # Get time-based breakdown
        if group_by == "week":
            if dimension == "cost_center":
                trends_data = summaries.get_weekly_totals_by_cost_center(db, start, end)
            elif dimension == "spend_category":
                # If filtering by a single cost center, get categories within it
                if cost_center_ids and len(cost_center_ids) == 1:
                    trends_data = summaries.get_weekly_totals_by_spend_category_in_cost_center(
                        db, cost_center_ids[0], start, end
                    )
                else:
                    # Otherwise, aggregate all spend categories
                    transactions = filt.get_transactions(
                        db, 
                        cost_center_ids=cost_center_ids,
                        spend_category_ids=spend_category_ids,
                        account=accounts,
                        start=start, 
                        end=end
                    )
                    
                    trends_data = defaultdict(lambda: defaultdict(float))
                    for txn in transactions:
                        year, week, _ = txn.date.isocalendar()
                        week_key = f"{year}-W{week:02d}"
                        for cat in txn.spend_categories:
                            trends_data[week_key][cat.name] += float(txn.amount)
                    trends_data = {k: dict(v) for k, v in trends_data.items()}
            else:  # total
                transactions = filt.get_transactions(
                    db,
                    cost_center_ids=cost_center_ids,
                    spend_category_ids=spend_category_ids,
                    account=accounts,
                    start=start,
                    end=end
                )
                
                trends_data = defaultdict(float)
                for txn in transactions:
                    year, week, _ = txn.date.isocalendar()
                    week_key = f"{year}-W{week:02d}"
                    trends_data[week_key] += float(txn.amount)
                trends_data = {k: {"Total": v} for k, v in trends_data.items()}
        
        else:  # month
            if dimension == "cost_center":
                trends_data = summaries.get_monthly_totals_by_cost_center(db, None, start, end)
            elif dimension == "spend_category":
                if cost_center_ids and len(cost_center_ids) == 1:
                    trends_data = summaries.get_monthly_totals_by_spend_category_in_cost_center(
                        db, cost_center_ids[0], None, start, end
                    )
                else:
                    transactions = filt.get_transactions(
                        db,
                        cost_center_ids=cost_center_ids,
                        spend_category_ids=spend_category_ids,
                        account=accounts,
                        start=start,
                        end=end
                    )
                    
                    trends_data = defaultdict(lambda: defaultdict(float))
                    for txn in transactions:
                        month_name = calendar.month_name[txn.date.month]
                        for cat in txn.spend_categories:
                            trends_data[month_name][cat.name] += float(txn.amount)
                    trends_data = {k: dict(v) for k, v in trends_data.items()}
            else:  # total
                trends_data = summaries.get_monthly_totals(db, None, start, end)
                trends_data = {k: {"Total": v} for k, v in trends_data.items()}
        
        # Convert to series format for frontend charting libraries
        series_data = defaultdict(list)
        time_periods = sorted(trends_data.keys())
        
        # Get all unique categories/names
        all_names = set()
        for period_data in trends_data.values():
            all_names.update(period_data.keys())
        
        # Build series for each name
        for name in sorted(all_names):
            for period in time_periods:
                value = trends_data[period].get(name, 0.0)
                series_data[name].append(value)
        
        series = [
            {"name": name, "data": values}
            for name, values in series_data.items()
        ]
        
        return {
            "group_by": group_by,
            "dimension": dimension,
            "time_periods": time_periods,
            "trends": trends_data,
            "series": series,
            "filters_applied": {
                "cost_center_ids": cost_center_ids,
                "spend_category_ids": spend_category_ids,
                "accounts": accounts,
                "date_range": {"start": start, "end": end} if start or end else None
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")
