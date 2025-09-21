# take parsed .csv and load into DB
from datetime import datetime

from .database import SessionLocal, init_db
from .models import Transaction, Category


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
                account=t["account"]
            )

            # Handle categories (many-to-many relationship)
            category_name = t.get("category")
            if category_name and category_name.strip():
                # Check if category exists, if not create it
                category = db_session.query(Category).filter(Category.name == category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db_session.add(category)
                    db_session.flush()  # Ensure category gets an ID

                # Associate category with transaction
                db_transaction.categories.append(category)

            db_session.add(db_transaction)
        db_session.commit()
    except:
        db_session.rollback()
        raise
    finally:
        if db_session is None:  # don’t close test sessions
            db_session.close()
