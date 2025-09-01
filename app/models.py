# setup database tables
from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    account = Column(String, nullable=False)
    category = Column(String, nullable=True) # schwab doesn't have categories - will make users add them manually

    # including this for logging and debugging purposes
    def __repr__(self):
        return f"<Transaction(date={self.date}, amount={self.amount}, account={self.account})>"
