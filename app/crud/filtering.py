# app/crud/filtering.py - sets up the R in CRUD for enhanced filtering functions
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

import datetime
from typing import List, Optional, Union

from ..models import Transaction, SpendCategory, CostCenter


# ---------------------
# COST CENTER QUERIES
# ---------------------


def get_all_cost_centers(session: Session) -> List[CostCenter]:
    """Get all cost centers."""
    return session.query(CostCenter).all()


def get_cost_center_by_id(session: Session, cost_center_id: int) -> Optional[CostCenter]:
    """Get a specific cost center."""
    return session.query(CostCenter).filter(CostCenter.id == cost_center_id).first()


def get_cost_center_by_name(session: Session, name: str) -> Optional[CostCenter]:
    """Get a cost center by name."""
    return session.query(CostCenter).filter(CostCenter.name == name).first()


# ---------------------
# SPEND CATEGORY QUERIES
# ---------------------


def get_all_spend_categories(session: Session) -> List[SpendCategory]:
    """Get all spend categories."""
    return session.query(SpendCategory).all()


def get_spend_category_by_id(session: Session, spend_category_id: int) -> Optional[SpendCategory]:
    """Get a specific spend category."""
    return session.query(SpendCategory).filter(SpendCategory.id == spend_category_id).first()


def get_spend_category_by_name(session: Session, name: str) -> Optional[SpendCategory]:
    """Get a spend category by name."""
    return session.query(SpendCategory).filter(SpendCategory.name == name).first()


# ---------------------
# TRANSACTION FILTERING
# ---------------------


def get_transactions(
    session: Session,
    account: Optional[Union[str, List[str]]] = None,
    spend_category_ids: Optional[Union[int, List[int]]] = None,
    cost_center_ids: Optional[Union[int, List[int]]] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
    include_uncategorized_categories: bool = False,
    include_uncategorized_cost_centers: bool = False,
    sort_by: str = "date",
    sort_order: str = "desc",
    limit: Optional[int] = None,
    offset: Optional[int] = None,
) -> List[Transaction]:
    """
    Fetch transactions with optional filters.

    Args:
        account: Single account name or list of account names
        spend_category_ids: Single ID or list of spend category IDs
        cost_center_ids: Single ID or list of cost center IDs
        start: Start date (inclusive) - if provided alone, shows all txns from this date forward
        end: End date (inclusive) - if provided alone, shows all txns up to this date
        min_amount: Minimum amount (inclusive) - if provided alone, shows all txns >= this amount
        max_amount: Maximum amount (inclusive) - if provided alone, shows all txns <= this amount
        search: Keyword search in description
        include_uncategorized_categories: Include transactions with no spend categories
        include_uncategorized_cost_centers: Include transactions with no cost center
        sort_by: Field to sort by (date, amount, description, account)
        sort_order: Sort order (asc, desc)
        limit: Maximum number of results
        offset: Number of results to skip

    Returns:
        List of transactions matching the filters
    """
    query = session.query(Transaction)

    # Account filter - supports multiple accounts
    if account:
        accounts = [account] if isinstance(account, str) else account
        query = query.filter(Transaction.account.in_(accounts))

    # Spend categories - supports multiple selections
    if spend_category_ids is not None:
        ids = [spend_category_ids] if isinstance(spend_category_ids, int) else spend_category_ids
        if include_uncategorized_categories:
            query = query.filter(or_(Transaction.spend_categories.any(SpendCategory.id.in_(ids)), ~Transaction.spend_categories.any()))
        else:
            query = query.filter(Transaction.spend_categories.any(SpendCategory.id.in_(ids)))
    elif include_uncategorized_categories:
        query = query.filter(~Transaction.spend_categories.any())

    # Cost centers - supports multiple selections
    if cost_center_ids is not None:
        ids = [cost_center_ids] if isinstance(cost_center_ids, int) else cost_center_ids
        if include_uncategorized_cost_centers:
            query = query.filter(or_(Transaction.cost_center_id.in_(ids), Transaction.cost_center_id.is_(None)))
        else:
            query = query.filter(Transaction.cost_center_id.in_(ids))
    elif include_uncategorized_cost_centers:
        query = query.filter(Transaction.cost_center_id.is_(None))

    # Date range (inclusive, supports start-only or end-only)
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)

    # Amount range (inclusive, supports min-only or max-only)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # Search - searches in description
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(Transaction.description.ilike(search_pattern))

    # Sorting
    sort_field = {
        "date": Transaction.date,
        "amount": Transaction.amount,
        "description": Transaction.description,
        "account": Transaction.account,
    }.get(sort_by, Transaction.date)

    query = query.order_by(desc(sort_field) if sort_order.lower() == "desc" else sort_field)

    # Pagination
    if offset is not None:
        query = query.offset(offset)
    if limit is not None:
        query = query.limit(limit)

    return query.all()


def get_uncategorized_cost_center_transactions(session: Session) -> List[Transaction]:
    """Get all transactions that have no cost center assigned."""
    return session.query(Transaction).filter(Transaction.cost_center_id.is_(None)).all()


def get_uncategorized_spend_category_transactions(session: Session) -> List[Transaction]:
    """Get all transactions that have no spend categories assigned."""
    return session.query(Transaction).filter(~Transaction.spend_categories.any()).all()


# ---------------------
# CONVENIENCE FUNCTIONS
# ---------------------


def get_all_transactions(session: Session) -> List[Transaction]:
    """Get all transactions without filters."""
    return get_transactions(session)


def get_transactions_by_account(session: Session, account: str) -> List[Transaction]:
    """Get all transactions for a specific account."""
    return get_transactions(session, account=account)


def get_transactions_by_date_range(session: Session, start: datetime.date, end: datetime.date) -> List[Transaction]:
    """Get all transactions within a date range."""
    return get_transactions(session, start=start, end=end)


def get_transactions_by_spend_category(session: Session, spend_category_id: int) -> List[Transaction]:
    """Get all transactions with a specific spend category."""
    return get_transactions(session, spend_category_ids=spend_category_id)


def get_transactions_by_cost_center(session: Session, cost_center_id: int) -> List[Transaction]:
    """Get all transactions in a specific cost center."""
    return get_transactions(session, cost_center_ids=cost_center_id)


def get_recent_transactions(session: Session, limit: int = 25, account: Optional[str] = None) -> List[Transaction]:
    """Get most recent transactions, optionally filtered by account."""
    query = session.query(Transaction)
    if account:
        query = query.filter(Transaction.account == account)
    
    return query.order_by(desc(Transaction.date), desc(Transaction.id)).limit(limit).all()
