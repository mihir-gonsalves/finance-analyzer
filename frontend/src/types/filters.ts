// frontend/src/types/filters.ts - defines the types of transaction filters available
export interface TransactionFilters {
  dateFrom: string;
  dateTo: string;
  spend_category_ids: number[];
  cost_center_ids: number[];
  accounts: string[];
  minAmount: string;
  maxAmount: string;
  searchTerm: string;
}
