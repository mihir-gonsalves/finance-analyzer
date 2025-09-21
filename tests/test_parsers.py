import os
import tempfile
import csv
import pytest

from app import parsers


def make_temp_csv(headers, rows):
    """Helper to create a temporary CSV file with given headers + rows."""
    tmp = tempfile.NamedTemporaryFile(delete=False, mode="w", newline="")
    writer = csv.DictWriter(tmp, fieldnames=headers)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    tmp.close()
    return tmp.name


# ---------------------------
# Discover tests
# ---------------------------
def test_load_discover_csv_success():
    file_path = make_temp_csv(
        headers=["Trans. Date", "Description", "Amount", "Category"],
        rows=[{"Trans. Date": "08/01/2023", "Description": "Coffee",
               "Amount": "3.50", "Category": "Food"}]
    )

    txns = parsers.load_discover_csv(file_path)
    os.unlink(file_path)

    assert len(txns) == 1
    assert txns[0]["account"] == "Discover"
    assert txns[0]["amount"] == -3.50  # Positive CSV amount becomes negative expense


def test_load_discover_csv_credit():
    """Test that negative CSV amounts (credits/returns) become positive in ledger."""
    file_path = make_temp_csv(
        headers=["Trans. Date", "Description", "Amount", "Category"],
        rows=[{"Trans. Date": "08/05/2023", "Description": "Return refund",
               "Amount": "-25.00", "Category": "Returns"}]
    )

    txns = parsers.load_discover_csv(file_path)
    os.unlink(file_path)

    assert len(txns) == 1
    assert txns[0]["account"] == "Discover"
    assert txns[0]["amount"] == 25.00  # Negative CSV amount becomes positive credit


def test_load_discover_csv_wrong_headers():
    file_path = make_temp_csv(
        headers=["Date", "Description", "Withdrawal", "Deposit", "Check #"],
        rows=[{"Date": "08/01/2023", "Description": "ATM",
               "Withdrawal": "20", "Deposit": "", "Check #": ""}]
    )

    with pytest.raises(ValueError) as e:
        parsers.load_discover_csv(file_path)

    os.unlink(file_path)
    assert "Discover export" in str(e.value)


# ---------------------------
# Schwab tests
# ---------------------------
def test_load_schwab_csv_success():
    file_path = make_temp_csv(
        headers=["Date", "Description", "Withdrawal", "Deposit", "Check #"],
        rows=[{"Date": "08/02/2023", "Description": "Paycheck",
               "Withdrawal": "", "Deposit": "1500", "Check #": ""}]
    )

    txns = parsers.load_schwab_csv(file_path)
    os.unlink(file_path)

    assert len(txns) == 1
    assert txns[0]["account"] == "Schwab Checking"
    assert txns[0]["amount"] == 1500.0


def test_load_schwab_csv_wrong_headers():
    file_path = make_temp_csv(
        headers=["Trans. Date", "Description", "Amount", "Category"],
        rows=[{"Trans. Date": "08/01/2023", "Description": "Coffee",
               "Amount": "3.50", "Category": "Food"}]
    )

    with pytest.raises(ValueError) as e:
        parsers.load_schwab_csv(file_path)

    os.unlink(file_path)
    assert "Schwab Checking export" in str(e.value)


# ---------------------------
# Router tests
# ---------------------------
def test_parse_csv_routes_to_discover():
    file_path = make_temp_csv(
        headers=["Trans. Date", "Description", "Amount", "Category"],
        rows=[{"Trans. Date": "08/01/2023", "Description": "Coffee",
               "Amount": "3.50", "Category": "Food"}]
    )

    txns = parsers.parse_csv(file_path, "Discover")
    os.unlink(file_path)

    assert len(txns) == 1
    assert txns[0]["account"] == "Discover"


def test_parse_csv_unknown_institution():
    file_path = make_temp_csv(
        headers=["Trans. Date", "Description", "Amount", "Category"],
        rows=[]
    )

    with pytest.raises(ValueError) as e:
        parsers.parse_csv(file_path, "RandomBank")

    os.unlink(file_path)
    assert "No parser available" in str(e.value)
