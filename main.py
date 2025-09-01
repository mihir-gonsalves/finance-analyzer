from app.parsers import load_discover_csv, load_schwab_csv
from app.loaders import save_transactions

if __name__ == "__main__":
    discover_txns = load_discover_csv("data/discover.csv")
    schwab_txns = load_schwab_csv("data/schwab.csv")

    all_txns = discover_txns + schwab_txns
    save_transactions(all_txns)
    print(f"Saved {len(all_txns)} transactions to the database!")
