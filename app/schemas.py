# pydantic enforces data integrity by enabling type checking into python's more lax OOP
from pydantic import BaseModel

import datetime
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int

    class Config:
        orm_mode = True


class TransactionBase(BaseModel):
    description: str
    amount: float
    account: str
    date: datetime.date


class TransactionCreate(TransactionBase):
    category_names: Optional[List[str]] = []


class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    account: Optional[str] = None
    category_names: Optional[List[str]] = None
    date: Optional[datetime.date] = None


class TransactionOut(TransactionBase):
    id: int
    categories: List[CategoryOut] = []

    class Config:
        orm_mode = True   # lets Pydantic work with SQLAlchemy models
