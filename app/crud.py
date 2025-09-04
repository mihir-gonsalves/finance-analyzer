from sqlalchemy.orm import Session

import datetime

from .models import Transaction
from app import schemas


# ---------------------
# CREATE
# ---------------------
def create_transaction(db: Session, txn: schemas.TransactionCreate) -> Transaction:
    """
    Add a new transaction to the database.
    If no date is provided, defaults to today.
    """
    new_tx = Transaction(
        date=txn.date or datetime.date.today(),
        description=txn.description,
        amount=txn.amount,
        account=txn.account,
        category=txn.category
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx


# ---------------------
# READ IS FOUND IN queries.py
# ---------------------


# ---------------------
# UPDATE
# ---------------------
def update_transaction(db: Session, tx_id: int, txn: schemas.TransactionUpdate) -> Transaction | None:
    """
    Update fields of an existing transaction.
    Only provided fields are updated.
    """
    existing_tx = db.get(Transaction, tx_id)
    if not existing_tx:
        return None

    # Update only provided fields
    for field, value in txn.dict(exclude_unset=True).items():
        setattr(existing_tx, field, value)

    db.commit()
    db.refresh(existing_tx)
    return existing_tx


# ---------------------
# DELETE
# ---------------------
def delete_transaction(db: Session, tx_id: int) -> bool:
    """
    Delete a transaction by ID.
    Returns True if deleted, False if not found.
    """
    tx = db.get(Transaction, tx_id)
    if not tx:
        return False

    db.delete(tx)
    db.commit()
    return True
