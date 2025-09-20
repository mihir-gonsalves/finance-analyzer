// types/filters.ts
export interface FilterState {
  dateFrom: string;
  dateTo: string;
  categories: string[];
  accounts: string[];
  minAmount: string;
  maxAmount: string;
  searchTerm: string;
}