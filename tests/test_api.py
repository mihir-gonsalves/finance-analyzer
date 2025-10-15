import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.database import SessionLocal, init_db


client = TestClient(app)


def setup_module(module):
    """Initialize a fresh test DB before running API tests."""
    init_db()


# ---------------------------
# Create via API
# ---------------------------
def test_create_transaction_api():
    txn = {
        "description": "Coffee",
        "amount": -4.5,
        "account": "Chase",
        "category": "Food",
        "date": str(datetime.date(2025, 3, 15))
    }

    response = client.post("/transactions/", json=txn)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] is not None
    assert data["description"] == "Coffee"
    assert data["amount"] == -4.5
    assert data["account"] == "Chase"
    assert data["category"] == "Food"


# ---------------------------
# Read via API
# ---------------------------
def test_read_transactions_api():
    response = client.get("/transactions/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(txn["description"] == "Coffee" for txn in data)


# ---------------------------
# Update via API
# ---------------------------
def test_update_transaction_api():
    # create a transaction to update
    txn = {
        "description": "Groceries",
        "amount": -50.0,
        "account": "Amex",
        "category": "Food",
        "date": str(datetime.date(2025, 3, 16)),
    }
    create_resp = client.post("/transactions/", json=txn)
    tx_id = create_resp.json()["id"]

    # Update category + amount
    update_txn = {"amount": -55.0, "category": "Dining"}
    response = client.put(f"/transactions/{tx_id}", json=update_txn)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == -55.0
    assert data["category"] == "Dining"


# ---------------------------
# Delete via API
# ---------------------------
def test_delete_transaction_api():
    # Create a transaction to delete
    txn = {
        "description": "Taxi",
        "amount": -20.0,
        "account": "Visa",
        "category": "Transport",
        "date": str(datetime.date(2025, 3, 17)),
    }
    create_resp = client.post("/transactions/", json=txn)
    tx_id = create_resp.json()["id"]

    # Delete it
    response = client.delete(f"/transactions/{tx_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Transaction deleted"

    # Confirm it's gone
    get_resp = client.get("/transactions/")
    tx_ids = [tx["id"] for tx in get_resp.json()]
    assert tx_id not in tx_ids
