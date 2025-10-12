# app/main.py - bundles core functionality
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .api import transactions


app = FastAPI(title="Transactions API")


# Allow cross-origin requests (for React frontend)
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",  # Sometimes Vite uses this
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # domains allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],         # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],         # Accept all headers
)


# Initialize the database (creates tables if not present)
init_db()


# Attach the transactions router
app.include_router(transactions.router)
