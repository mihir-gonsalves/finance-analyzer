# app/crud/totals.py - sets up the R in CRUD for enhanced totaling functions
from sqlalchemy.orm import Session
from sqlalchemy import func

import datetime
from typing import List, Optional, Union, Dict

from ..models import Transaction, SpendCategory, CostCenter


# ---------------------
# BASIC ANALYSIS (NO FILTERS)
# ---------------------


def get_totals_by_cost_center(
    session: Session,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, float]:
    """
    Get spending totals grouped by cost center (basic version without complex filters).
    Returns dict of {cost_center_name: total_amount}
    """
    return get_filtered_totals_by_cost_center(session, start=start, end=end)


def get_totals_by_spend_category(
    session: Session,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, float]:
    """
    Get spending totals grouped by spend category (basic version without complex filters).
    Returns dict of {spend_category_name: total_amount}
    """
    return get_filtered_totals_by_spend_category(session, start=start, end=end)


def get_totals_by_account(
    session: Session,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> Dict[str, float]:
    """
    Get spending totals grouped by account (basic version).
    Returns dict of {account_name: total_amount}
    """
    return get_filtered_totals_by_account(session, start=start, end=end)


def get_total_spent_by_cost_center(
    session: Session, 
    cost_center_id: int,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None
) -> float:
    """Return total amount spent in a specific cost center."""
    query = session.query(func.sum(Transaction.amount)).filter(Transaction.cost_center_id == cost_center_id)

    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)

    total = query.scalar()

    return float(total or 0.0)


def get_total_spent_by_spend_category(
    session: Session, 
    spend_category_id: int,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None
) -> float:
    """Return total amount spent for a specific spend category."""
    query = (
        session.query(func.sum(Transaction.amount))
        .join(Transaction.spend_categories)
        .filter(SpendCategory.id == spend_category_id)
    )
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    total = query.scalar()

    return float(total or 0.0)


# ---------------------
# DYNAMIC DRILL-DOWN ANALYSIS
# ---------------------


def get_filtered_totals_by_spend_category(
    session: Session,
    cost_center_ids: Optional[Union[int, List[int]]] = None,
    account: Optional[Union[str, List[str]]] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
) -> Dict[str, float]:
    """
    Get spending totals by spend category with optional filters.
    
    Use case: When user filters by cost center "Food", show breakdown by 
    spend categories like "Restaurants", "Groceries", etc.
    
    Returns:
        {spend_category_name: total_amount}
    """
    query = session.query(
        SpendCategory.name,
        func.sum(Transaction.amount).label('total')
    ).join(Transaction.spend_categories)
    
    # Apply all filters
    if cost_center_ids is not None:
        ids = [cost_center_ids] if isinstance(cost_center_ids, int) else cost_center_ids
        query = query.filter(Transaction.cost_center_id.in_(ids))
    
    if account:
        accounts = [account] if isinstance(account, str) else account
        query = query.filter(Transaction.account.in_(accounts))
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    
    query = query.group_by(SpendCategory.name)
    
    result = {name: float(total) for name, total in query.all()}
    
    # Add uncategorized transactions matching filters
    uncategorized_query = session.query(func.sum(Transaction.amount)).filter(
        ~Transaction.spend_categories.any()
    )
    
    if cost_center_ids is not None:
        ids = [cost_center_ids] if isinstance(cost_center_ids, int) else cost_center_ids
        uncategorized_query = uncategorized_query.filter(Transaction.cost_center_id.in_(ids))
    
    if account:
        accounts = [account] if isinstance(account, str) else account
        uncategorized_query = uncategorized_query.filter(Transaction.account.in_(accounts))
    
    if start:
        uncategorized_query = uncategorized_query.filter(Transaction.date >= start)
    if end:
        uncategorized_query = uncategorized_query.filter(Transaction.date <= end)
    
    if min_amount is not None:
        uncategorized_query = uncategorized_query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        uncategorized_query = uncategorized_query.filter(Transaction.amount <= max_amount)
    
    if search:
        uncategorized_query = uncategorized_query.filter(Transaction.description.ilike(f"%{search}%"))
    
    uncategorized_total = uncategorized_query.scalar()
    if uncategorized_total:
        result["Uncategorized"] = float(uncategorized_total)
    
    return result


def get_filtered_totals_by_cost_center(
    session: Session,
    spend_category_ids: Optional[Union[int, List[int]]] = None,
    account: Optional[Union[str, List[str]]] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
) -> Dict[str, float]:
    """
    Get spending totals by cost center with optional filters.
    
    Use case: When user filters by spend category "Miami", show breakdown by 
    cost centers like "Food", "Entertainment", "Transportation", etc.
    
    Returns:
        {cost_center_name: total_amount}
    """
    query = session.query(
        CostCenter.name,
        func.sum(Transaction.amount).label('total')
    ).join(Transaction, Transaction.cost_center_id == CostCenter.id)
    
    # Apply all filters
    if spend_category_ids is not None:
        ids = [spend_category_ids] if isinstance(spend_category_ids, int) else spend_category_ids
        query = query.filter(Transaction.spend_categories.any(SpendCategory.id.in_(ids)))
    
    if account:
        accounts = [account] if isinstance(account, str) else account
        query = query.filter(Transaction.account.in_(accounts))
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    
    query = query.group_by(CostCenter.name)
    
    result = {name: float(total) for name, total in query.all()}
    
    # Add uncategorized transactions matching filters
    uncategorized_query = session.query(func.sum(Transaction.amount)).filter(
        Transaction.cost_center_id.is_(None)
    )
    
    if spend_category_ids is not None:
        ids = [spend_category_ids] if isinstance(spend_category_ids, int) else spend_category_ids
        uncategorized_query = uncategorized_query.filter(Transaction.spend_categories.any(SpendCategory.id.in_(ids)))
    
    if account:
        accounts = [account] if isinstance(account, str) else account
        uncategorized_query = uncategorized_query.filter(Transaction.account.in_(accounts))
    
    if start:
        uncategorized_query = uncategorized_query.filter(Transaction.date >= start)
    if end:
        uncategorized_query = uncategorized_query.filter(Transaction.date <= end)
    
    if min_amount is not None:
        uncategorized_query = uncategorized_query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        uncategorized_query = uncategorized_query.filter(Transaction.amount <= max_amount)
    
    if search:
        uncategorized_query = uncategorized_query.filter(Transaction.description.ilike(f"%{search}%"))
    
    uncategorized_total = uncategorized_query.scalar()
    if uncategorized_total:
        result["Uncategorized"] = float(uncategorized_total)
    
    return result


def get_filtered_totals_by_account(
    session: Session,
    spend_category_ids: Optional[Union[int, List[int]]] = None,
    cost_center_ids: Optional[Union[int, List[int]]] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
) -> Dict[str, float]:
    """
    Get spending totals by account with optional filters.
    
    Returns:
        {account_name: total_amount}
    """
    query = session.query(Transaction.account, func.sum(Transaction.amount).label('total'))
    
    # Apply filters
    if spend_category_ids is not None:
        ids = [spend_category_ids] if isinstance(spend_category_ids, int) else spend_category_ids
        query = query.filter(Transaction.spend_categories.any(SpendCategory.id.in_(ids)))
    
    if cost_center_ids is not None:
        ids = [cost_center_ids] if isinstance(cost_center_ids, int) else cost_center_ids
        query = query.filter(Transaction.cost_center_id.in_(ids))
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    
    if search:
        query = query.filter(Transaction.description.ilike(f"%{search}%"))
    
    query = query.group_by(Transaction.account)
    
    return {account: float(total) for account, total in query.all()}
