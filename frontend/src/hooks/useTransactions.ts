// frontend/src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import type { TransactionFilters } from "../types/filters";
import { buildFilterParams } from "../utils/filterUtils";

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

export interface UpdateTransactionData {
  id: number;
  date?: string;
  description?: string;
  category_names?: string[];
  amount?: number;
  account?: string;
}

// =====================
// READ Hooks
// =====================

// Fetch all transactions (no filters)
export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await client.get("/transactions");
      return res.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

// Fetch filtered transactions - all filtering handled by backend
export function useFilteredTransactions(filters: TransactionFilters) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "filtered", filters],
    queryFn: async () => {
      const params = buildFilterParams(filters);
      const res = await client.get(`/transactions/filter?${params.toString()}`);
      return res.data;
    },
    staleTime: 30000, // 30 seconds
    // Only fetch if filters are active
    enabled: Object.values(filters).some(val =>
      Array.isArray(val) ? val.length > 0 : val !== ''
    ),
  });
}

// =====================
// WRITE Hooks (Mutations)
// =====================

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