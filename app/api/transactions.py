from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException

import datetime

from app import crud, queries, schemas
from app.database import SessionLocal


router = APIRouter(
    prefix="/transactions",
    tags=["transactions"],
)


# Dependency: provide a session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------
# READ endpoints (queries.py)
# ---------------------
@router.get("/", response_model=list[schemas.TransactionOut])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    all_txns = queries.get_all_transactions(db)
    return all_txns[skip : skip + limit]


@router.get("/filter", response_model=list[schemas.TransactionOut])
def read_filtered_transactions(
    account: str | None = None,
    category: str | None = None,
    start: datetime.date | None = None,
    end: datetime.date | None = None,
    db: Session = Depends(get_db),
):
    """
    Filter transactions dynamically by account, category, and/or date range.
    """
    return queries.get_transactions(db, account=account, category=category, start=start, end=end)


@router.get("/accounts", response_model=list[str])
def get_accounts(db: Session = Depends(get_db)):
    return queries.get_unique_accounts(db)


@router.get("/totals/category/{category}", response_model=float)
def total_by_category(category: str, db: Session = Depends(get_db)):
    return queries.get_total_spent_by_category(db, category)


@router.get("/totals/weekly/{year}", response_model=list[tuple[str, float]])
def weekly_totals(year: int, db: Session = Depends(get_db)):
    return queries.get_weekly_totals(db, year)


@router.get("/totals/monthly/{year}", response_model=list[tuple[str, float]])
def monthly_totals(year: int, db: Session = Depends(get_db)):
    return queries.get_monthly_totals(db, year)


# ---------------------
# CREATE, UPDATE, DELETE endpoints (crud.py)
# ---------------------
@router.post("/", response_model=schemas.TransactionOut)
def create_transaction(txn: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db, txn)


@router.put("/{txn_id}", response_model=schemas.TransactionOut)
def update_transaction(txn_id: int, txn: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    updated = crud.update_transaction(db, txn_id, txn)
    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return updated


@router.delete("/{txn_id}", response_model=dict)
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_transaction(db, txn_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted"}
