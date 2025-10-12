# app/queries.py - sets up the R in CRUD for enhanced filtering functions
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_

import calendar
from collections import defaultdict
import datetime
from typing import List, Optional, Tuple, Union

from .models import Transaction, Category
from .schemas import TransactionUpdate


# ---------------------
# Basic retrievals
# ---------------------
def get_all_transactions(session: Session) -> List[Transaction]:
    return session.query(Transaction).all()


def get_transactions_by_account(session: Session, account: str) -> List[Transaction]:
    return session.query(Transaction).filter(Transaction.account == account).all()


def get_transactions_by_date_range(session: Session, start: datetime.date, end: datetime.date) -> List[Transaction]:
    return session.query(Transaction).filter(Transaction.date >= start, Transaction.date <= end).all()


def get_transactions_by_category(session: Session, category: str) -> List[Transaction]:
    return session.query(Transaction).join(Transaction.categories).filter(Category.name == category).all()


# ---------------------
# Flexible multi-filter query
# ---------------------
def get_transactions(
    session: Session,
    account: Optional[Union[str, List[str]]] = None,
    category: Optional[Union[str, List[str]]] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> List[Transaction]:
    """
    Fetch transactions with optional filters.
    Any combination of account(s), category/categories, and date range can be dynamically applied.
    For categories, returns transactions that have ANY of the specified categories.
    """
    print(f"Query filters - account: {account} (type: {type(account)}), category: {category} (type: {type(category)})")  # Debug log

    query = session.query(Transaction)

    # Handle account filtering
    if account:
        if isinstance(account, str):
            print(f"Filtering by single account: {account}")
            query = query.filter(Transaction.account == account)
        else:
            print(f"Filtering by account list: {account}")
            query = query.filter(Transaction.account.in_(account))

    # Handle category filtering with many-to-many relationship
    if category:
        if isinstance(category, str):
            if category == '':
                # Handle uncategorized (no categories) case
                # Find transactions that have no categories
                query = query.filter(~Transaction.categories.any())
            else:
                # Find transactions that have this specific category
                query = query.filter(Transaction.categories.any(Category.name == category))
        else:
            # Handle list of categories
            if '' in category: # Include uncategorized transactions and specified categories
                other_categories = [cat for cat in category if cat != ''] # List of non-empty categories
                if other_categories:
                    query = query.filter(
                        or_(
                            ~Transaction.categories.any(),  # No categories (uncategorized)
                            Transaction.categories.any(Category.name.in_(other_categories))  # Has any of these categories
                        )
                    )
                else:
                    # Only uncategorized selected
                    query = query.filter(~Transaction.categories.any())
            else:
                # No uncategorized, just regular categories
                # Find transactions that have any of these categories
                query = query.filter(Transaction.categories.any(Category.name.in_(category)))

    # Handle date filtering
    if start:
        query = query.filter(Transaction.date >= start)
    if end:
        query = query.filter(Transaction.date <= end)

    return query.all()


# ---------------------
# Aggregates
# ---------------------
def get_total_spent_by_category(session: Session, category: str) -> float:
    """
    Return the total amount spent for transactions that have the given category.
    """
    total = (session.query(func.sum(Transaction.amount))
             .join(Transaction.categories)
             .filter(Category.name == category)
             .scalar())
    return total or 0.0


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
        week_number = date_val.isocalendar()[1]  # (year, week_number, weekday)
        week_label = f"{year}-W{week_number:02d}"
        totals[week_label] += amount

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
        totals[month_name] += amount

    return list(totals.items())


def get_unique_accounts(session: Session) -> List[str]:
    """
    Return a list of unique account names from the transactions table.
    """
    return [acc for (acc,) in session.query(Transaction.account).distinct().all()]


def get_unique_categories(session: Session) -> List[str]:
    """
    Return a list of unique category names from the categories table.
    """
    return [cat for (cat,) in session.query(Category.name).distinct().all()]

