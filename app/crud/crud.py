# app/crud/crud.py - sets up create, update, and delete functions
from sqlalchemy.orm import Session

import datetime
from typing import Optional

from ..models import Transaction, SpendCategory, CostCenter
from app import schemas


# ---------------------
# READ OPERATIONS IN filtering.py, summaries.py, and totals.py
# ---------------------


# ---------------------
# COST CENTER CRUD
# ---------------------


def get_or_create_cost_center(db: Session, name: str) -> CostCenter:
    """
    Get existing cost center or create if it doesn't exist.
    This is internal database utility function (assumes data is clean/validated) - for parsing.
    """
    cost_center = db.query(CostCenter).filter(CostCenter.name == name).first()
    
    if not cost_center:
        cost_center = CostCenter(name=name)
        db.add(cost_center)
        db.commit()
        db.refresh(cost_center)
    
    return cost_center


def create_cost_center(db: Session, cat: schemas.CostCenterCreate) -> CostCenter:
    """
    Create a new cost center.
    This is API layer function - will validate frontend user input.
    """
    return get_or_create_cost_center(db, cat.name)


def get_or_create_uncategorized_cost_center(session: Session) -> CostCenter:
    """
    Get or create the 'Uncategorized' cost center.
    This ensures there's always a default cost center available.
    """
    uncategorized = session.query(CostCenter).filter(CostCenter.name == "Uncategorized").first()
    
    if not uncategorized:
        uncategorized = CostCenter(name="Uncategorized")
        session.add(uncategorized)
        session.commit()
        session.refresh(uncategorized)
    
    return uncategorized

def delete_cost_center(db: Session, cost_center_id: int, cascade: bool = False) -> bool:
    """
    Delete a cost center.
    
    Args:
        cascade: If True, also delete all associated spend categories
                 If False, only delete if no spend categories exist
    """
    cost_center = db.get(CostCenter, cost_center_id)
    if not cost_center:
        return False
    
    # Check if any transactions use this cost center
    has_transactions = db.query(Transaction).filter(Transaction.cost_center_id == cost_center_id).first() is not None
    
    if has_transactions and not cascade:
        return False
    
    if cascade:
        # Set cost_center_id to None for all transactions using this cost center
        db.query(Transaction).filter(Transaction.cost_center_id == cost_center_id).update({Transaction.cost_center_id: None})

    db.delete(cost_center)
    db.commit()
    return True


# ---------------------
# SPEND CATEGORY CRUD
# ---------------------


def get_or_create_spend_category(db: Session, name: str) -> SpendCategory:
    """
    Get existing spend category or create if it doesn't exist.
    This is internal database utility function (assumes data is clean/validated) - for parsing.
    """
    spend_category = db.query(SpendCategory).filter(SpendCategory.name == name).first()
    
    if not spend_category:
        spend_category = SpendCategory(name=name)
        db.add(spend_category)
        db.commit()
        db.refresh(spend_category)
    
    return spend_category


def create_spend_category(db: Session, cat: schemas.SpendCategoryCreate) -> SpendCategory:
    """
    Create a new spend category.
    This is API layer function - will validate frontend user input.
    """
    return get_or_create_spend_category(db, cat.name)


def get_or_create_uncategorized_spend_category(db: Session) -> SpendCategory:
    """
    Get or create the 'Uncategorized' spend category.
    This ensures there's always a default spend category available.
    """
    uncategorized = db.query(SpendCategory).filter(SpendCategory.name == "Uncategorized").first()
    
    if not uncategorized:
        uncategorized = SpendCategory(name="Uncategorized")
        db.add(uncategorized)
        db.commit()
        db.refresh(uncategorized)
    
    return uncategorized


def delete_spend_category(db: Session, spend_category_id: int) -> bool:
    """Delete a spend category if it's not being used by any transactions."""
    spend_category = db.get(SpendCategory, spend_category_id)
    if not spend_category:
        return False
    
    if spend_category.transactions:
        return False
    
    db.delete(spend_category)
    db.commit()
    return True


def _resolve_spend_categories(db: Session, names: list[str]) -> list[SpendCategory]:
    """Get or create spend categories from a list of names (deduplicated)."""
    seen: set[str] = set()
    categories: list[SpendCategory] = []

    for name in names:
        name = name.strip()
        if name and name not in seen:
            category = get_or_create_spend_category(db, name)
            categories.append(category)
            seen.add(name)

    # If no categories were provided, default to Uncategorized
    if not categories:
        categories = [get_or_create_uncategorized_spend_category(db)]

    return categories


# ---------------------
# TRANSACTION CRUD (Automatic Cleanup)
# ---------------------


def create_transaction(db: Session, txn: schemas.TransactionCreate) -> Transaction:
    # Cost center (default to Uncategorized)
    if txn.cost_center_name and txn.cost_center_name.strip():
        cost_center = get_or_create_cost_center(db, txn.cost_center_name.strip())
    else:
        cost_center = get_or_create_uncategorized_cost_center(db)

    # Spend categories
    spend_categories = _resolve_spend_categories(db, txn.spend_category_names or [])

    new_tx = Transaction(
        date=txn.date or datetime.date.today(),
        description=txn.description,
        amount=txn.amount,
        account=txn.account,
        cost_center=cost_center,
        spend_categories=spend_categories,
    )

    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx


def update_transaction(db: Session, tx_id: int, txn: schemas.TransactionUpdate, auto_cleanup: bool = True):
    existing_tx = db.get(Transaction, tx_id)
    if not existing_tx:
        return None

    old_categories = list(existing_tx.spend_categories)
    old_cost_center_id = existing_tx.cost_center_id

    update_data = txn.model_dump(exclude_unset=True)
    cost_center_name = update_data.pop('cost_center_name', None)
    spend_category_names = update_data.pop('spend_category_names', None)

    # Apply scalar fields
    for field, value in update_data.items():
        setattr(existing_tx, field, value)

    # Cost center (default to Uncategorized)
    if cost_center_name is not None:
        if cost_center_name.strip():
            existing_tx.cost_center = get_or_create_cost_center(db, cost_center_name.strip())
        else:
            existing_tx.cost_center = get_or_create_uncategorized_cost_center(db)

    # Spend categories
    if spend_category_names is not None:
        existing_tx.spend_categories = _resolve_spend_categories(db, spend_category_names)

    db.commit()

    if auto_cleanup:
        _cleanup_orphaned_items_after_transaction_change(db, old_categories)
        if old_cost_center_id and old_cost_center_id != existing_tx.cost_center_id:
            old_cc = db.get(CostCenter, old_cost_center_id)
            if old_cc:
                db.refresh(old_cc)
                if not old_cc.transactions:
                    db.delete(old_cc)
                    db.commit()

    db.refresh(existing_tx)
    return existing_tx



def delete_transaction(db: Session, tx_id: int, auto_cleanup: bool = True) -> bool:
    """Delete a transaction along with any orphaned cost centers and spend categories"""
    tx = db.get(Transaction, tx_id)
    if not tx:
        return False

    old_categories = list(tx.spend_categories) if auto_cleanup else []
    old_cost_center_id = tx.cost_center_id if auto_cleanup else None

    db.delete(tx)
    db.commit()

    # Cleanup
    if auto_cleanup:
        if old_categories:
            _cleanup_orphaned_items_after_transaction_change(db, old_categories)
        if old_cost_center_id:
            old_cc = db.get(CostCenter, old_cost_center_id)
            if old_cc:
                db.refresh(old_cc)
                if not old_cc.transactions:
                    db.delete(old_cc)
                    db.commit()

    return True


# ---------------------
# CLEANUP FUNCTIONS (Manual Cleanup)
# ---------------------


def cleanup_orphaned_spend_categories(db: Session) -> int:
    """
    Delete all spend categories not used by any transactions.
    Returns count of deleted categories.
    """
    orphaned = db.query(SpendCategory).filter( ~SpendCategory.transactions.any() ).all()
    
    count = len(orphaned)
    for cat in orphaned:
        db.delete(cat)
    
    db.commit()
    return count


def cleanup_orphaned_cost_centers(db: Session) -> int:
    """Delete all cost centers that have no transactions."""
    orphaned = db.query(CostCenter).filter( ~CostCenter.transactions.any() ).all()
    
    count = len(orphaned)
    for cc in orphaned:
        db.delete(cc)
    
    db.commit()
    return count


def cleanup_all_orphaned(db: Session) -> dict:
    """
    Run full cleanup: orphaned spend categories, then orphaned cost centers.
    Returns dict with counts of deleted items.
    """
    spend_cat_count = cleanup_orphaned_spend_categories(db)
    cost_center_count = cleanup_orphaned_cost_centers(db)
    
    return {"spend_categories_deleted": spend_cat_count, "cost_centers_deleted": cost_center_count, "total_deleted": spend_cat_count + cost_center_count}


def _cleanup_orphaned_items_after_transaction_change( db: Session, old_spend_categories: list[SpendCategory] ) -> dict:
    """Delete spend categories that are no longer associated with any transactions."""
    deleted = 0
    for cat in old_spend_categories:
        try:
            db.refresh(cat)
            if not cat.transactions:
                db.delete(cat)
                deleted += 1
        except Exception as e:
            # Optional: todo log exception
            pass

    db.commit()
    return {"spend_categories": deleted}
