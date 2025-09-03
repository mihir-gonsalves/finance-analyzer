# this is the R in CRUD (for enhanced filtering purposes)
from sqlalchemy.orm import Session
from sqlalchemy import func

import calendar
from collections import defaultdict
import datetime
from typing import List, Optional, Tuple

from app.models import Transaction


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
    account: Optional[str] = None,
    category: Optional[str] = None,
    start: Optional[datetime.date] = None,
    end: Optional[datetime.date] = None,
) -> List[Transaction]:
    """
    Fetch transactions with optional filters.
    Any combination of account, category, and date range can be dynamically applied.
    """
    query = session.query(Transaction)
    if account:
        query = query.filter(Transaction.account == account)
    if category:
        query = query.filter(Transaction.category == category)
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
