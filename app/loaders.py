# take parsed .csv and load into DB
from datetime import datetime

from .database import SessionLocal, init_db
from .models import Transaction


def save_transactions(transactions, db_session=None):
    if db_session is None:
        init_db()
        db_session = SessionLocal()

    try:
        for t in transactions:
            db_transaction = Transaction(
                date=t["date"],
                description=t["description"],
                amount=t["amount"],
                account=t["account"],
                category=t["category"],
            )
            db_session.add(db_transaction)
        db_session.commit()
    except:
        db_session.rollback()
        raise
    finally:
        if db_session is None:  # don’t close test sessions
            db_session.close()
