# parse .csv downloads from Discover CC and Schwab Checking Account
import csv
import re
from datetime import datetime # need the class and don't want to write datetime.datetime.strptime()


def validate_headers(expected_headers, actual_headers, source_name):
    missing = [h for h in expected_headers if h not in actual_headers]
    if missing:
        raise ValueError(
            f"CSV file does not look like a {source_name} export. "
            f"Missing columns: {missing}"
        )


def clean_currency_string(value):
    """Remove currency symbols, commas, and whitespace from monetary values."""
    if not value or value.strip() == "":
        return 0.0
    
    # Remove dollar signs, commas, and whitespace
    cleaned = re.sub(r'[$,\s]', '', str(value).strip())
    
    # Handle empty string after cleaning
    if not cleaned:
        return 0.0
    
    try:
        return float(cleaned)
    except ValueError:
        # If we still can't convert, return 0 and let the caller handle it
        print(f"Warning: Could not convert '{value}' to float, using 0.0")
        return 0.0


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
                "amount": clean_currency_string(row["Amount"]),
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
            # Clean and process withdrawal amount
            withdrawal_str = row.get("Withdrawal", "").strip()
            deposit_str = row.get("Deposit", "").strip()
            
            if withdrawal_str and withdrawal_str != "":
                amount = -clean_currency_string(withdrawal_str)
            elif deposit_str and deposit_str != "":
                amount = clean_currency_string(deposit_str)
            else:
                amount = 0.0

            transactions.append({
                "date": datetime.strptime(row["Date"], "%m/%d/%Y").date(),
                "description": row["Description"],
                "amount": amount,
                "account": "Schwab Checking",
                "category": None  # Schwab doesn't export categories
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