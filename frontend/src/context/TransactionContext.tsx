// frontend/src/context/TransactionContext.tsx - react context providing filter state and whether filters are applied globally
import React, { createContext, useContext } from "react";
import { useFilteredOrAllTransactions } from "../hooks/useFilters";
import type { Transaction } from "../hooks/useTransactions";
import type { TransactionFilters } from "../types/filters";


interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  appliedFilters: TransactionFilters;
}


const TransactionContext = createContext<TransactionContextType | undefined>(undefined);


interface TransactionProviderProps {
  filters: TransactionFilters;
  children: React.ReactNode;
}


export function TransactionProvider({ filters, children }: TransactionProviderProps) {
  const query = useFilteredOrAllTransactions(filters);

  const value: TransactionContextType = {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    appliedFilters: filters,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}


export function useTransactionData() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactionData must be used within TransactionProvider");
  }
  return context;
}
