# this is the R in CRUD (for enhanced filtering purposes)
from sqlalchemy.orm import Session
from sqlalchemy import func

import calendar
from collections import defaultdict

from app.models import Transaction


def get_all_transactions(session: Session):
    return session.query(Transaction).all()


def get_transactions_by_account(session: Session, account: str):
    return session.query(Transaction).filter(Transaction.account == account).all()


def get_transactions_by_date_range(session: Session, start, end):
    return (
        session.query(Transaction)
        .filter(Transaction.date >= start)
        .filter(Transaction.date <= end)
        .all()
    )


def get_transactions_by_category(session: Session, category: str):
    return session.query(Transaction).filter(Transaction.category == category).all()


# Flexible multi-filter query
def get_transactions(
    session: Session,
    account: str = None,
    category: str = None,
    start=None,
    end=None,
):
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


# Aggregate queries
def get_total_spent_by_category(session: Session, category: str):
    """
    Return the total amount spent for a given category.
    """
    return (
        session.query(func.sum(Transaction.amount))
        .filter(Transaction.category == category)
        .scalar()
        or 0
    )


def get_weekly_totals(session: Session, year: int):
    """
    Return total spending grouped by week for a given year.
    Weeks are labeled as 'YYYY-Www' (e.g., '2025-W01').
    """
    # Fetch all transactions for the given year
    results = session.query(Transaction.date, Transaction.amount).filter(
        func.strftime("%Y", Transaction.date) == str(year)
    ).all()

    totals = defaultdict(float)
    for date, amount in results:
        # date.isocalendar() returns (year, week_number, weekday)
        week_number = date.isocalendar()[1]
        week_label = f"{year}-W{week_number:02d}"  # e.g., "2025-W01"
        totals[week_label] += amount

    return list(totals.items())


def get_monthly_totals(session: Session, year: int):
    """
    Return total spending grouped by month for a given year.
    Months are labeled as full names ('January', 'February', ...).
    """
    # Get all transactions for the year
    results = session.query(Transaction.date, Transaction.amount).filter(
        func.strftime("%Y", Transaction.date) == str(year)
    ).all()

    totals = defaultdict(float)
    for date, amount in results:
        month_name = calendar.month_name[date.month]  # 1 -> 'January'
        totals[month_name] += amount

    return list(totals.items())


def get_unique_accounts(session: Session):
    """
    Return a list of unique account names from the transactions table.
    """
    return [acc for (acc,) in session.query(Transaction.account).distinct().all()]
