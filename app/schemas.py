# pydantic enforces data integrity by enabling type checking into python's more lax OOP
from pydantic import BaseModel

import datetime
from typing import Optional


class TransactionBase(BaseModel):
    description: str
    amount: float
    account: str
    category: Optional[str] = None
    date: datetime.date


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    account: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime.date] = None


class TransactionOut(TransactionBase):
    id: int

    class Config:
        orm_mode = True   # lets Pydantic work with SQLAlchemy models
