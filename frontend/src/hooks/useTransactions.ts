import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import type { FilterState } from "../types/filters";

export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  categories: Category[];
  amount: number;
  account: string;
}

export interface CreateTransactionData {
  date: string;
  description: string;
  category_names?: string[];
  amount: number;
  account: string;
}

// Fetch all transactions
export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await client.get("/transactions");
      return res.data;
    },
  });
}

// Fetch filtered transactions from backend
export function useFilteredTransactions(filters: FilterState) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "filtered", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Add array filters manually
      if (filters.accounts.length > 0) {
        filters.accounts.forEach(account => {
          params.append('account', account);
        });
      }
      if (filters.categories.length > 0) {
        filters.categories.forEach(category => {
          const catValue = category === 'Uncategorized' ? '' : category;
          params.append('category', catValue);
        });
      }

      // Add other filters
      if (filters.dateFrom) params.append('start', filters.dateFrom);
      if (filters.dateTo) params.append('end', filters.dateTo);

      console.log('Sending filter params:', params.toString()); // Debug log

      const res = await client.get(`/transactions/filter?${params.toString()}`);

      // Apply client-side filters that backend doesn't handle
      let transactions = res.data;

      // Amount filters
      if (filters.minAmount) {
        transactions = transactions.filter((t: Transaction) => t.amount >= parseFloat(filters.minAmount));
      }
      if (filters.maxAmount) {
        transactions = transactions.filter((t: Transaction) => t.amount <= parseFloat(filters.maxAmount));
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        transactions = transactions.filter((t: Transaction) => {
          const matchesDescription = t.description.toLowerCase().includes(searchLower);
          const matchesCategory = t.categories.some(cat => cat.name.toLowerCase().includes(searchLower));
          const matchesAccount = t.account.toLowerCase().includes(searchLower);
          return matchesDescription || matchesCategory || matchesAccount;
        });
      }

      return transactions;
    },
  });
}

// Create a new transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (txn: CreateTransactionData) => {
      const res = await client.post("/transactions", txn);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

// Delete a transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export interface UpdateTransactionData {
  id: number;
  date?: string;
  description?: string;
  category_names?: string[];
  amount?: number;
  account?: string;
}

// Update a transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (txn: UpdateTransactionData) => {
      const { id, ...updateData } = txn;
      const res = await client.put(`/transactions/${id}`, updateData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}