from fastapi import FastAPI

from .database import init_db
from .api import transactions


app = FastAPI(title="Transactions API")


# Initialize the database (creates tables if not present)
init_db()


# Attach the transactions router
app.include_router(transactions.router)
