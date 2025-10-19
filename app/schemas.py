# app/schemas.py - pydantic enforces data integrity by enabling type checking into python's more lax OOP
from pydantic import BaseModel, Field, field_validator

import datetime
from typing import Optional, List


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Category name cannot be empty or whitespace only')
        return v.strip()


class CategoryCreate(CategoryBase):
    pass


class CategoryWithID(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=200)
    amount: float  # Allow positive and negative amounts (refunds/credits)
    account: str = Field(..., min_length=1, max_length=50)
    date: datetime.date

    @field_validator('description')
    @classmethod
    def description_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Description cannot be empty or whitespace only')
        return v.strip()

    @field_validator('account')
    @classmethod
    def account_must_not_be_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Account name cannot be empty or whitespace only')
        return v.strip()


class TransactionCreate(TransactionBase):
    category_names: Optional[List[str]] = Field(default_factory=list)

    @field_validator('category_names')
    @classmethod
    def validate_category_names(cls, v):
        if v is None:
            return []
        # Remove duplicates and empty strings
        return list(set(cat.strip() for cat in v if cat and cat.strip()))


class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=200)
    amount: Optional[float] = None  # Allow positive and negative amounts
    account: Optional[str] = Field(None, min_length=1, max_length=50)
    category_names: Optional[List[str]] = None
    date: Optional[datetime.date] = None

    @field_validator('description')
    @classmethod
    def description_must_not_be_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Description cannot be empty or whitespace only')
        return v.strip() if v else v

    @field_validator('account')
    @classmethod
    def account_must_not_be_empty(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError('Account name cannot be empty or whitespace only')
        return v.strip() if v else v

    @field_validator('category_names')
    @classmethod
    def validate_category_names(cls, v):
        if v is None:
            return None
        # Remove duplicates and empty strings
        return list(set(cat.strip() for cat in v if cat and cat.strip())) or None


class TransactionWithCategories(TransactionBase):
    id: int
    categories: List[CategoryWithID] = []

    class Config:
        from_attributes = True
