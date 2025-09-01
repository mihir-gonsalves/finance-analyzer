# automatically sets up a new temporary SQLite DB and session for each test
# pytest automatically sees the session fixture from conftest.py and injects it into the test function
# used by test_crud.py and test_queries.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import pytest
import datetime

from app.models import Base, Transaction


@pytest.fixture
def session(tmp_path):
    # use a brand new sqlite db just for tests
    test_engine = create_engine(
        f"sqlite:///{tmp_path}/test.db", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()

    # seed sample transactions
    db.add_all([
        Transaction(
            date=datetime.date(2025, 1, 1),
            description="Coffee Shop",
            amount=5.25,
            account="Discover",
            category="Food"
        ),
        Transaction(
            date=datetime.date(2025, 1, 2),
            description="Grocery Store",
            amount=-50.00,
            account="Schwab Checking",
            category="Groceries"
        ),
        Transaction(
            date=datetime.date(2025, 1, 10),
            description="Rent",
            amount=-1200.00,
            account="Schwab Checking",
            category="Housing"
        ),
        Transaction(
            date=datetime.date(2025, 2, 5),
            description="Concert Ticket",
            amount=-100.00,
            account="Discover",
            category="Entertainment"
        )
    ])
    db.commit()

    try:
        yield db
    finally:
        db.close()
