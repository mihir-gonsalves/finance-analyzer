from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import datetime
from datetime import date
import pytest

from app.models import Transaction, Base
from app.queries import (
    get_all_transactions,
    get_transactions_by_account,
    get_transactions_by_date_range,
    get_transactions_by_category,
    get_transactions,
    get_total_spent_by_category,
    get_weekly_totals,
    get_monthly_totals,
    get_unique_accounts,
)


@pytest.fixture
def session(tmp_path):
    # use a brand new sqlite db just for tests
    test_engine = create_engine(
        f"sqlite:///{tmp_path}/test.db", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()

    # seed sample transactions
    db.add_all([
        Transaction(
            date=datetime.date(2025, 1, 1),
            description="Coffee Shop",
            amount=5.25,
            account="Discover",
            category="Food"
        ),
        Transaction(
            date=datetime.date(2025, 1, 2),
            description="Grocery Store",
            amount=-50.00,
            account="Schwab Checking",
            category="Groceries"
        ),
        Transaction(
            date=datetime.date(2025, 1, 10),
            description="Rent",
            amount=-1200.00,
            account="Schwab Checking",
            category="Housing"
        ),
        Transaction(
            date=datetime.date(2025, 2, 5),
            description="Concert Ticket",
            amount=-100.00,
            account="Discover",
            category="Entertainment"
        )
    ])
    db.commit()

    try:
        yield db
    finally:
        db.close()


# ---------------------------
# Default query tests
# ---------------------------
def test_get_all_transactions(session):
    results = get_all_transactions(session)
    assert len(results) == 4


def test_get_transactions_by_account(session):
    results = get_transactions_by_account(session, "Discover")
    assert len(results) == 2
    assert set(r.description for r in results) == {"Coffee Shop", "Concert Ticket"}


def test_get_transactions_by_date_range(session):
    results = get_transactions_by_date_range(
        session,
        datetime.date(2025, 1, 1),
        datetime.date(2025, 1, 5)
    )
    assert len(results) == 2  # coffee + groceries


def test_get_transactions_by_category(session):
    results = get_transactions_by_category(session, "Housing")
    assert len(results) == 1
    assert results[0].description == "Rent"


# ---------------------------
# Flexible multi-filter query
# ---------------------------
def test_get_transactions_with_filters(session):
    # account + category
    results = get_transactions(session, account="Discover", category="Food")
    assert len(results) == 1
    assert results[0].description == "Coffee Shop"

    # category + date range
    results = get_transactions(
        session,
        category="Entertainment",
        start=datetime.date(2025, 2, 1),
        end=datetime.date(2025, 2, 28),
    )
    assert len(results) == 1
    assert results[0].description == "Concert Ticket"

    # no filters = all transactions
    results = get_transactions(session)
    assert len(results) == 4


# ---------------------------
# Aggregate queries
# ---------------------------
def test_get_total_spent_by_category(session):
    total_housing = get_total_spent_by_category(session, "Housing")
    assert total_housing == -1200.00

    total_food = get_total_spent_by_category(session, "Food")
    assert total_food == 5.25


def test_get_weekly_totals(session):
    results = dict(get_weekly_totals(session, 2025))
    
    totals_by_week = {}
    transactions = [
        (date(2025, 1, 1), 5.25),       # Coffee Shop
        (date(2025, 1, 2), -50.0),      # Grocery Store
        (date(2025, 1, 10), -1200.0),   # Rent
        (date(2025, 2, 5), -100.0)      # Concert Ticket
    ]

    for d, amt in transactions:
        week_num = d.isocalendar()[1]
        label = f"{d.year}-W{week_num:02d}"
        totals_by_week[label] = totals_by_week.get(label, 0) + amt

    # Check that all weeks exist
    for week_label in totals_by_week:
        assert week_label in results
        assert round(results[week_label], 2) == round(totals_by_week[week_label], 2)


def test_get_monthly_totals(session):
    # Call function with year 2025
    results = dict(get_monthly_totals(session, 2025))

    # Check that month names exist as keys
    assert "January" in results
    assert "February" in results

    # January: coffee (5.25) + groceries (-50.00) + rent (-1200.00)
    assert round(results["January"], 2) == round(5.25 - 50.0 - 1200.0, 2)

    # February: seeded transaction (Concert Ticket -100.0)
    assert results["February"] == -100.0


def test_get_unique_accounts(session):
    accounts = get_unique_accounts(session)
    assert set(accounts) == {"Discover", "Schwab Checking"}
