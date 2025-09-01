import os
import tempfile
from datetime import date
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base, Transaction
from app.loaders import save_transactions

@pytest.fixture
def test_db():
    # create a temporary SQLite DB
    db_fd, db_path = tempfile.mkstemp()
    engine = create_engine(f"sqlite:///{db_path}")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # create tables
    Base.metadata.create_all(bind=engine)

    yield TestingSessionLocal  # this is what the test will use

    os.close(db_fd)
    os.unlink(db_path)

def test_save_transactions(test_db):
    # fake transactions to insert
    fake_txns = [
        {
            "date": "01/15/2025",
            "description": "Coffee Shop",
            "amount": 5.25,
            "account": "Discover",
            "category": "Food"
        },
        {
            "date": "01/20/2025",
            "description": "Grocery Store",
            "amount": -50.00,
            "account": "Schwab Checking",
            "category": None
        }
    ]

    # call save_transactions with our fake session
    db = test_db()
    save_transactions(fake_txns, db_session=db)

    # query back
    results = db.query(Transaction).all()
    assert len(results) == 2

    t1 = results[0]
    assert t1.description == "Coffee Shop"
    assert t1.amount == 5.25
    assert t1.account == "Discover"
    assert t1.category == "Food"
    assert isinstance(t1.date, date)

    t2 = results[1]
    assert t2.description == "Grocery Store"
    assert t2.amount == -50.00
    assert t2.account == "Schwab Checking"
    assert t2.category is None
    assert isinstance(t2.date, date)
