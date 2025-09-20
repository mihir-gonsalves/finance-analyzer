import datetime

from app.schemas import TransactionCreate, TransactionUpdate
from app.models import Transaction
from app.crud import (
    create_transaction,
    update_transaction,
    delete_transaction,
)


# ---------------------------
# Create tests
# ---------------------------
def test_create_transaction(session):
    tx = create_transaction(
        session,
        TransactionCreate(
            description = "Book Purchase",
            amount = -25.0,
            account = "Discover",
            category = "Books",
            date = datetime.date(2025, 3, 10)
        ),
    )
    assert tx.id is not None
    assert tx.description == "Book Purchase"
    assert tx.amount == -25.0
    assert tx.account == "Discover"
    assert tx.category == "Books"


# ---------------------------
# Update tests
# ---------------------------
def test_update_transaction(session):
    tx = create_transaction(
        session,
        TransactionCreate(
            description = "Lunch",
            amount = -10.0,
            account = "Discover",
            category = "Food",
            date = datetime.date(2025, 3, 11)
        ),
    )
    updated = update_transaction(
        session, 
        tx.id,
        TransactionUpdate(
            amount=-12.0, 
            category="Dining"
        ),
    )
    assert updated.amount == -12.0
    assert updated.category == "Dining"


# ---------------------------
# Delete tests
# ---------------------------
def test_delete_transaction(session):
    tx = create_transaction(
        session,
        TransactionCreate(
            description = "Movie Ticket",
            amount = -15.0,
            account = "Discover",
            category = "Entertainment",
            date = datetime.date(2025, 3, 12)
        ),
    )
    result = delete_transaction(session, tx.id)
    assert result is True
    assert session.get(Transaction, tx.id) is None

    # Deleting non-existent ID
    result = delete_transaction(session, 9999)
    assert result is False
