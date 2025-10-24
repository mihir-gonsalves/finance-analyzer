# app/crud/summaries.py - sets up the R in CRUD for enhanced summaries
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract

import calendar
from collections import defaultdict
import datetime
from typing import List, Optional, Tuple, Dict

from ..models import Transaction, SpendCategory, CostCenter
from .totals import get_totals_by_cost_center, get_totals_by_spend_category


# ---------------------
# WEEKLY TOTALS
# ---------------------


def get_weekly_totals_by_cost_center(
    session: Session,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, Dict[str, float]]:
    """
    Get weekly spending totals grouped by cost center.
    
    Returns:
        {week_string: {cost_center_name: total, ...}, ...}
        Week string format: "YYYY-WW" (e.g., "2024-W01")
    """
    query = session.query(
        Transaction.date,
        Transaction.amount,
        CostCenter.name
    ).outerjoin(CostCenter, Transaction.cost_center_id == CostCenter.id)
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    results = query.all()
    
    totals: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    
    for date_val, amount, cost_center_name in results:
        year, week, _ = date_val.isocalendar()
        week_key = f"{year}-W{week:02d}"
        cc_name = cost_center_name or "Uncategorized"
        totals[week_key][cc_name] += float(amount)
    
    return {week: dict(centers) for week, centers in totals.items()}


def get_weekly_totals_by_spend_category_in_cost_center(
    session: Session,
    cost_center_id: int,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, Dict[str, float]]:
    """
    Get weekly spending totals grouped by spend category within a specific cost center.
    
    Returns:
        {week_string: {spend_category_name: total, ...}, ...}
    """
    query = session.query(
        Transaction.date,
        Transaction.amount,
        SpendCategory.name
    ).join(Transaction.spend_categories).filter(Transaction.cost_center_id == cost_center_id)
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    results = query.all()
    
    totals: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    
    for date_val, amount, spend_category_name in results:
        year, week, _ = date_val.isocalendar()
        week_key = f"{year}-W{week:02d}"
        totals[week_key][spend_category_name] += float(amount)
    
    # Add uncategorized transactions
    uncategorized_query = session.query(
        Transaction.date,
        Transaction.amount
    ).filter(and_(Transaction.cost_center_id == cost_center_id, ~Transaction.spend_categories.any()))
    
    if start:
        uncategorized_query = uncategorized_query.filter(Transaction.date >= start)
    if end:
        uncategorized_query = uncategorized_query.filter(Transaction.date <= end)
    
    for date_val, amount in uncategorized_query.all():
        year, week, _ = date_val.isocalendar()
        week_key = f"{year}-W{week:02d}"
        totals[week_key]["Uncategorized"] += float(amount)
    
    return {week: dict(categories) for week, categories in totals.items()}


# ---------------------
# MONTHLY TOTALS
# ---------------------


def get_monthly_totals_by_cost_center(
    session: Session,
    year: Optional[int] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, Dict[str, float]]:
    """
    Get monthly spending totals grouped by cost center.
    
    Returns:
        {month_name: {cost_center_name: total, ...}, ...}
    """
    query = session.query(
        Transaction.date,
        Transaction.amount,
        CostCenter.name
    ).outerjoin(CostCenter, Transaction.cost_center_id == CostCenter.id)
    
    if start:
        query = query.filter(Transaction.date >= start)
    elif year:
        query = query.filter(extract('year', Transaction.date) == year)
    
    if end:
        query = query.filter(Transaction.date <= end)
    elif year:
        query = query.filter(extract('year', Transaction.date) == year)
    
    results = query.all()
    
    totals: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    
    for date_val, amount, cost_center_name in results:
        month_name = calendar.month_name[date_val.month]
        cc_name = cost_center_name or "Uncategorized"
        totals[month_name][cc_name] += float(amount)
    
    return {month: dict(centers) for month, centers in totals.items()}


def get_monthly_totals_by_spend_category_in_cost_center(
    session: Session,
    cost_center_id: int,
    year: Optional[int] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, Dict[str, float]]:
    """
    Get monthly spending totals grouped by spend category within a specific cost center.
    
    Returns:
        {month_name: {spend_category_name: total, ...}, ...}
    """
    query = session.query(
        Transaction.date,
        Transaction.amount,
        SpendCategory.name
    ).join(Transaction.spend_categories).filter(Transaction.cost_center_id == cost_center_id)
    
    if start:
        query = query.filter(Transaction.date >= start)
    elif year:
        query = query.filter(extract('year', Transaction.date) == year)
    
    if end:
        query = query.filter(Transaction.date <= end)
    elif year:
        query = query.filter(extract('year', Transaction.date) == year)
    
    results = query.all()
    
    totals: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    
    for date_val, amount, spend_category_name in results:
        month_name = calendar.month_name[date_val.month]
        totals[month_name][spend_category_name] += float(amount)
    
    # Add uncategorized
    uncategorized_query = session.query(
        Transaction.date,
        Transaction.amount
    ).filter(and_(Transaction.cost_center_id == cost_center_id, ~Transaction.spend_categories.any()))
    
    if start:
        uncategorized_query = uncategorized_query.filter(Transaction.date >= start)
    elif year:
        uncategorized_query = uncategorized_query.filter(extract('year', Transaction.date) == year)
    
    if end:
        uncategorized_query = uncategorized_query.filter(Transaction.date <= end)
    elif year:
        uncategorized_query = uncategorized_query.filter(extract('year', Transaction.date) == year)
    
    for date_val, amount in uncategorized_query.all():
        month_name = calendar.month_name[date_val.month]
        totals[month_name]["Uncategorized"] += float(amount)
    
    return {month: dict(categories) for month, categories in totals.items()}


def get_monthly_totals(
    session: Session,
    year: Optional[int] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, float]:
    """
    Get total spending by month.
    
    Returns:
        {month_name: total_amount}
    """
    query = session.query(Transaction.date, Transaction.amount)
    
    if start:
        query = query.filter(Transaction.date >= start)
    elif year:
        query = query.filter(extract('year', Transaction.date) == year)
    
    if end:
        query = query.filter(Transaction.date <= end)
    elif year:
        query = query.filter(extract('year', Transaction.date) == year)
    
    results = query.all()
    
    totals: Dict[str, float] = defaultdict(float)
    for date_val, amount in results:
        month_name = calendar.month_name[date_val.month]
        totals[month_name] += float(amount)
    
    return dict(totals)


# ---------------------
# SEARCH KEYWORD TOTALS
# ---------------------


def get_total_by_search_keyword(
    session: Session,
    search: str,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> float:
    """
    Get total amount for transactions matching a search keyword in description.
    """
    query = session.query(func.sum(Transaction.amount)).filter(Transaction.description.ilike(f"%{search}%"))
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    total = query.scalar()
    
    return float(total or 0.0)


# ---------------------
# ACCOUNT SUMMARIES
# ---------------------


def get_account_summary(
    session: Session,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> List[Tuple[str, float, int]]:
    """
    Get summary statistics by account.
    
    Returns list of (account_name, total_amount, transaction_count) tuples.
    """
    query = session.query(Transaction.account, func.sum(Transaction.amount).label('total'), func.count(Transaction.id).label('count'))
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    query = query.group_by(Transaction.account)
    
    return [(acc, float(total), count) for acc, total, count in query.all()]


# ---------------------
# TOP SPENDING
# ---------------------


def get_top_spending_categories(
    session: Session,
    limit: int = 10,
    by_cost_center: bool = False,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> List[Tuple[str, float]]:
    """
    Get top spending categories or cost centers by total amount.
    
    Returns:
        List of (name, total) tuples sorted by total descending.
    """
    if by_cost_center:
        summary = get_totals_by_cost_center(session, start, end)
    else:
        summary = get_totals_by_spend_category(session, start, end)
    
    return sorted(summary.items(), key=lambda x: x[1], reverse=True)[:limit]


# ---------------------
# METADATA QUERIES
# ---------------------


def get_unique_accounts(session: Session) -> List[str]:
    """Return list of unique account names."""
    return [acc for (acc,) in session.query(Transaction.account).distinct().all()]


def get_date_range(session: Session) -> Tuple[Optional[datetime.date], Optional[datetime.date]]:
    """Return earliest and latest transaction dates."""
    result = session.query(func.min(Transaction.date), func.max(Transaction.date)).first()
    
    return result if result else (None, None)


def get_transaction_count(
    session: Session,
    account: Optional[str] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None
) -> int:
    """Get count of transactions matching filters."""
    query = session.query(func.count(Transaction.id))
    
    if account:
        query = query.filter(Transaction.account == account)
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    return query.scalar() or 0
