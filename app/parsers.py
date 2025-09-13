# parse .csv downloads from Discover CC and Schwab Checking Account
import csv
from datetime import datetime # need the class and don't want to write datetime.datetime.strptime()


def validate_headers(expected_headers, actual_headers, source_name):
    missing = [h for h in expected_headers if h not in actual_headers]
    if missing:
        raise ValueError(
            f"CSV file does not look like a {source_name} export. "
            f"Missing columns: {missing}"
        )


def load_discover_csv(file_path: str):
    transactions = []
    with open(file_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        validate_headers(
            ["Trans. Date", "Description", "Amount", "Category"],
            reader.fieldnames,
            "Discover"
        )
        for row in reader:
            transactions.append({
                "date": datetime.strptime(row["Trans. Date"], "%m/%d/%Y").date(),
                "description": row["Description"],
                "amount": float(row["Amount"]),
                "account": "Discover",
                "category": row["Category"]
            })
    return transactions


def load_schwab_csv(file_path: str):
    transactions = []
    with open(file_path, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)

        # match your real Schwab headers
        expected = ["Date", "Description", "Withdrawal", "Deposit"]
        validate_headers(expected, reader.fieldnames, "Schwab Checking")

        for row in reader:
            if row.get("Withdrawal"):
                amount = -float(row["Withdrawal"].replace(",", ""))
            elif row.get("Deposit"):
                amount = float(row["Deposit"].replace(",", ""))
            else:
                amount = 0.0

            transactions.append({
                "date": datetime.strptime(row["Date"], "%m/%d/%Y").date(),
                "description": row["Description"],
                "amount": amount,
                "account": "Schwab Checking",
                "category": None  # Schwab doesn’t export categories
            })
    return transactions


def parse_csv(file_path: str, institution: str):
    """Route to the correct parser based on institution name from UI."""
    institution = institution.lower().strip()
    if institution == "discover":
        return load_discover_csv(file_path)
    elif institution in ["schwab", "schwab checking"]:
        return load_schwab_csv(file_path)
    else:
        raise ValueError(f"No parser available for institution: {institution}")
