from sqlalchemy.orm import Session

import datetime

from .models import Transaction, Category
from app import schemas


# ---------------------
# CATEGORY CRUD
# ---------------------
def get_or_create_category(db: Session, name: str) -> Category:
    """
    Get existing category by name or create if it doesn't exist.
    """
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        category = Category(name=name)
        db.add(category)
        db.commit()
        db.refresh(category)
    return category


def get_all_categories(db: Session) -> list[Category]:
    """
    Get all categories.
    """
    return db.query(Category).all()


def delete_category(db: Session, category_id: int) -> bool:
    """
    Delete a category by ID if it's not being used by any transactions.
    Returns True if deleted, False if not found or still in use.
    """
    category = db.get(Category, category_id)
    if not category:
        return False

    # Check if category is still being used
    if category.transactions:
        return False

    db.delete(category)
    db.commit()
    return True


# ---------------------
# CREATE
# ---------------------
def create_transaction(db: Session, txn: schemas.TransactionCreate) -> Transaction:
    """
    Add a new transaction to the database with multiple categories.
    If no date is provided, defaults to today.
    """
    new_tx = Transaction(
        date=txn.date or datetime.date.today(),
        description=txn.description,
        amount=txn.amount,
        account=txn.account,
    )

    # Handle categories
    if txn.category_names:
        for category_name in txn.category_names:
            category = get_or_create_category(db, category_name)
            new_tx.categories.append(category)

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

    # Handle category updates separately
    category_names = None
    update_data = txn.model_dump(exclude_unset=True)
    if 'category_names' in update_data:
        category_names = update_data.pop('category_names')

    # Update regular fields
    for field, value in update_data.items():
        setattr(existing_tx, field, value)

    # Update categories if provided
    if category_names is not None:
        # Clear existing categories
        existing_tx.categories.clear()
        # Add new categories
        for category_name in category_names:
            category = get_or_create_category(db, category_name)
            existing_tx.categories.append(category)

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
