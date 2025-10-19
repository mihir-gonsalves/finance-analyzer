// frontend/src/types/filters.ts - defines the types of transaction filters available in filter panel
export interface TransactionFilters {
  dateFrom: string;
  dateTo: string;
  categories: string[];
  accounts: string[];
  minAmount: string;
  maxAmount: string;
  searchTerm: string;
}
