# contains the code for C-U-D functions in CRUD
# for R function --> find in app/queries.py
from sqlalchemy.orm import Session

from datetime import date

from app.models import Transaction


# CREATE
def create_transaction(
    session: Session,
    description: str,
    amount: float,
    account: str,
    category: str = None,
    date_: date = None,
):
    """
    Add a new transaction to the database.
    If no date is provided, defaults to today.
    """
    if date_ is None:
        date_ = date.today()

    new_tx = Transaction(
        date=date_,
        description=description,
        amount=amount,
        account=account,
        category=category,
    )
    session.add(new_tx)
    session.commit()
    session.refresh(new_tx)
    return new_tx


# for R function --> find in app/queries.py


# UPDATE
def update_transaction(
    session: Session,
    tx_id: int,
    description: str = None,
    amount: float = None,
    account: str = None,
    category: str = None,
    date_: date = None,
):
    """
    Update fields of an existing transaction by ID.
    Only provided fields will be updated.
    """
    tx = session.get(Transaction, tx_id)
    if not tx:
        return None

    if description is not None:
        tx.description = description
    if amount is not None:
        tx.amount = amount
    if account is not None:
        tx.account = account
    if category is not None:
        tx.category = category
    if date_ is not None:
        tx.date = date_

    session.commit()
    session.refresh(tx)
    return tx


# DELETE 
def delete_transaction(session: Session, tx_id: int):
    """
    Delete a transaction by ID.
    Returns True if deleted, False if not found.
    """
    tx = session.get(Transaction, tx_id)
    if not tx:
        return False
    session.delete(tx)
    session.commit()
    return True
