# this is the R in CRUD (for enhanced filtering purposes)
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

import calendar
from collections import defaultdict
import datetime
from typing import List, Optional, Tuple, Union

from .models import Transaction
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
    return session.query(Transaction).filter(Transaction.category == category).all()


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
    """
    print(f"Query filters - account: {account} (type: {type(account)}), category: {category} (type: {type(category)})")  # Debug log

    query = session.query(Transaction)
    if account:
        # Handle both single string (backward compatibility) and list
        if isinstance(account, str):
            print(f"Filtering by single account: {account}")
            query = query.filter(Transaction.account == account)
        else:
            print(f"Filtering by account list: {account}")
            query = query.filter(Transaction.account.in_(account))
    if category:
        # Handle both single string (backward compatibility) and list
        if isinstance(category, str):
            if category == '':
                # Handle uncategorized (NULL) case
                query = query.filter(Transaction.category.is_(None))
            else:
                query = query.filter(Transaction.category == category)
        else:
            # Handle list of categories, including empty string for uncategorized
            if '' in category:
                # Split into NULL check and regular categories
                other_categories = [cat for cat in category if cat != '']
                if other_categories:
                    query = query.filter(
                        or_(
                            Transaction.category.is_(None),
                            Transaction.category.in_(other_categories)
                        )
                    )
                else:
                    # Only uncategorized selected
                    query = query.filter(Transaction.category.is_(None))
            else:
                # No uncategorized, just regular categories
                query = query.filter(Transaction.category.in_(category))
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
    Return the total amount spent for a given category.
    """
    total = session.query(func.sum(Transaction.amount)).filter(Transaction.category == category).scalar()
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
    Return a list of unique category names from the transactions table.
    Filters out None values.
    """
    return [cat for (cat,) in session.query(Transaction.category).distinct().all() if cat is not None]


# ---------------------
# Update
# ---------------------
def update_transaction(db: Session, db_txn: Transaction, txn_update: TransactionUpdate):
    for key, value in txn_update.dict(exclude_unset=True).items():
        setattr(db_txn, key, value)
    db.commit()
    db.refresh(db_txn)
    return db_txn
