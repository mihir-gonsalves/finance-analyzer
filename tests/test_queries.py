import datetime
from datetime import date

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


# ---------------------------
# Default query tests
# ---------------------------
def test_get_all_transactions(session):
    results = get_all_transactions(session)
    assert len(results) == 4  # pre-seeded by session fixture


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
    assert len(results) == 2  # Coffee Shop + Grocery Store


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
    assert get_total_spent_by_category(session, "Housing") == -1200.00
    assert get_total_spent_by_category(session, "Food") == 5.25


def test_get_weekly_totals(session):
    results = dict(get_weekly_totals(session, 2025))
    
    # expected weekly totals
    expected = {}
    for d, amt in [
        (date(2025, 1, 1), 5.25),       # Coffee Shop
        (date(2025, 1, 2), -50.0),      # Grocery Store
        (date(2025, 1, 10), -1200.0),   # Rent
        (date(2025, 2, 5), -100.0)      # Concert Ticket
    ]:
        week = d.isocalendar()[1]
        label = f"{d.year}-W{week:02d}"
        expected[label] = expected.get(label, 0) + amt

    for week_label, total in expected.items():
        assert round(results[week_label], 2) == round(total, 2)


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
