# app/queries.py - sets up the R in CRUD for enhanced filtering functions
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from decimal import Decimal

import calendar
from collections import defaultdict
import datetime
from typing import List, Optional, Tuple, Union

from .models import Transaction, Category
from .schemas import TransactionUpdate


# ---------------------
# Main filtering function - handles ALL filters
# ---------------------
def get_transactions(
    session: Session,
    account: Optional[Union[str, List[str]]] = None,
    category: Optional[Union[str, List[str]]] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None,
) -> List[Transaction]:
    """
    Fetch transactions with optional filters.
    All filters are optional and can be combined.
    
    Args:
        session: Database session
        account: Single account name or list of account names
        category: Single category or list of categories (empty string for uncategorized)
        start: Start date (inclusive)
        end: End date (inclusive)
        min_amount: Minimum transaction amount (inclusive)
        max_amount: Maximum transaction amount (inclusive)
        search: Search term to match against description, account, or category names
    
    Returns:
        List of transactions matching all provided filters
    """
    query = session.query(Transaction)

    # Account filter
    if account:
        if isinstance(account, str):
            query = query.filter(Transaction.account == account)
        else:
            query = query.filter(Transaction.account.in_(account))

    # Category filter (handles many-to-many relationship)
    if category is not None:
        query = _apply_category_filter(query, category)

    # Date range filters
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)

    # Amount range filters
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)

    # Search filter (description, account, or category name)
    if search:
        query = _apply_search_filter(query, search)

    return query.all()


def _apply_category_filter(query, category: Union[str, List[str]]):
    """
    Apply category filtering to a query.
    Handles single category, list of categories, and uncategorized transactions.
    """
    if isinstance(category, str):
        if category == '':
            # Uncategorized only
            return query.filter(~Transaction.categories.any())
        else:
            # Single category
            return query.filter(Transaction.categories.any(Category.name == category))
    else:
        # List of categories
        if '' in category:
            # Include uncategorized AND specified categories
            other_categories = [cat for cat in category if cat != '']
            if other_categories:
                return query.filter(
                    or_(
                        ~Transaction.categories.any(),
                        Transaction.categories.any(Category.name.in_(other_categories))
                    )
                )
            else:
                # Only uncategorized
                return query.filter(~Transaction.categories.any())
        else:
            # Regular categories only
            return query.filter(Transaction.categories.any(Category.name.in_(category)))


def _apply_search_filter(query, search_term: str):
    """
    Apply search filter across description, account, and category names.
    Case-insensitive partial matching.
    """
    search_pattern = f"%{search_term}%"
    return query.filter(
        or_(
            Transaction.description.ilike(search_pattern),
            Transaction.account.ilike(search_pattern),
            Transaction.categories.any(Category.name.ilike(search_pattern))
        )
    )


# ---------------------
# Simplified convenience functions (use main get_transactions)
# ---------------------
def get_all_transactions(session: Session) -> List[Transaction]:
    """Get all transactions without any filters."""
    return get_transactions(session)


def get_transactions_by_account(session: Session, account: str) -> List[Transaction]:
    """Get all transactions for a specific account."""
    return get_transactions(session, account=account)


def get_transactions_by_date_range(
    session: Session, 
    start: datetime.date, 
    end: datetime.date
) -> List[Transaction]:
    """Get all transactions within a date range."""
    return get_transactions(session, start=start, end=end)


def get_transactions_by_category(session: Session, category: str) -> List[Transaction]:
    """Get all transactions with a specific category."""
    return get_transactions(session, category=category)


# ---------------------
# Aggregates
# ---------------------
def get_total_spent_by_category(session: Session, category: str) -> float:
    """
    Return the total amount spent for transactions that have the given category.
    """
    total = (
        session.query(func.sum(Transaction.amount))
        .join(Transaction.categories)
        .filter(Category.name == category)
        .scalar()
    )
    return float(total or 0.0)


def get_spending_summary(
    session: Session,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> dict:
    """
    Get a summary of spending grouped by category for a date range.
    Returns dict with category names as keys and total amounts as values.
    """
    query = session.query(
        Category.name,
        func.sum(Transaction.amount).label('total')
    ).join(Transaction.categories)
    
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)
    
    query = query.group_by(Category.name)
    
    return {name: float(total) for name, total in query.all()}


def get_weekly_totals(session: Session, year: int) -> List[Tuple[str, float]]:
    """
    Return total spending grouped by week for a given year.
    Weeks are labeled as 'YYYY-Www' (e.g., '2025-W01').
    """
    results = session.query(Transaction.date, Transaction.amount).filter(
        func.strftime("%Y", Transaction.date) == str(year)
    ).all()

    totals: defaultdict[str, float] = defaultdict(float)
    for date_val, amount in results:
        week_number = date_val.isocalendar()[1]
        week_label = f"{year}-W{week_number:02d}"
        totals[week_label] += float(amount)

    return list(totals.items())


def get_monthly_totals(session: Session, year: int) -> List[Tuple[str, float]]:
    """
    Return total spending grouped by month for a given year.
    Months are labeled as full names ('January', 'February', ...).
    """
    results = session.query(Transaction.date, Transaction.amount).filter(
        func.strftime("%Y", Transaction.date) == str(year)
    ).all()

    totals: defaultdict[str, float] = defaultdict(float)
    for date_val, amount in results:
        month_name = calendar.month_name[date_val.month]
        totals[month_name] += float(amount)

    return list(totals.items())


def get_unique_accounts(session: Session) -> List[str]:
    """Return a list of unique account names from transactions."""
    return [acc for (acc,) in session.query(Transaction.account).distinct().all()]


def get_unique_categories(session: Session) -> List[str]:
    """Return a list of unique category names."""
    return [cat for (cat,) in session.query(Category.name).distinct().all()]
