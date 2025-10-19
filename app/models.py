# app/models.py - sets up SQLite database tables using SQLAlchemy ORM
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Table, Index
from sqlalchemy.orm import declarative_base, relationship


Base = declarative_base()


# Association table for many-to-many relationship
transaction_categories = Table(
    'transaction_categories',
    Base.metadata,
    Column('transaction_id', Integer, ForeignKey('transactions.id'), primary_key=True),
    Column('category_id', Integer, ForeignKey('categories.id'), primary_key=True)
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)

    # Many-to-many relationship with transactions
    transactions = relationship(
        "Transaction", 
        secondary=transaction_categories, 
        back_populates="categories"
    )

    def __repr__(self):
        return f"<Category(name={self.name})>"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)  # Index for date filtering
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    account = Column(String, nullable=False, index=True)  # Index for account filtering

    # Many-to-many relationship with categories
    categories = relationship(
        "Category", 
        secondary=transaction_categories, 
        back_populates="transactions"
    )

    # Composite index for common query pattern (account + date)
    __table_args__ = (
        Index('idx_account_date', 'account', 'date'),
    )

    def __repr__(self):
        return f"<Transaction(date={self.date}, amount={self.amount}, account={self.account})>"
