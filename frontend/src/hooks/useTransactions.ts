// frontend/src/hooks/useTransactions.ts - transaction CRUD operations and metadata queries (cost centers, spend categories, accounts)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";
import type { TransactionFilters } from "../types/filters";
import { buildFilterParams } from "../utils/filterUtils";


// ---------------------
// TYPE DEFINITIONS (matching backend schemas.py)
// ---------------------


export interface CostCenter {
  id: number;
  name: string;
}


export interface SpendCategory {
  id: number;
  name: string;
}


export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  account: string;
  cost_center: CostCenter | null; // Optional cost center
  spend_categories: SpendCategory[]; // Multiple spend categories
}


export interface CreateTransactionData {
  date: string;
  description: string;
  amount: number;
  account: string;
  cost_center_name?: string; // Backend expects name, not ID
  spend_category_names?: string[]; // Backend expects names, not IDs
}


export interface UpdateTransactionData {
  id: number;
  date?: string;
  description?: string;
  amount?: number;
  account?: string;
  cost_center_name?: string; // Backend expects name, not ID
  spend_category_names?: string[]; // Backend expects names, not IDs
}


// ---------------------
// METADATA QUERIES
// ---------------------


// Fetch all cost centers
export function useCostCenters() {
  return useQuery<{ cost_centers: CostCenter[]; count: number }>({
    queryKey: ["cost_centers"],
    queryFn: async () => {
      const res = await client.get("/transactions/meta/cost_centers");
      return res.data;
    },
    staleTime: 60000, // 1 minute
  });
}


// Fetch all spend categories
export function useSpendCategories() {
  return useQuery<{ spend_categories: SpendCategory[]; count: number }>({
    queryKey: ["spend_categories"],
    queryFn: async () => {
      const res = await client.get("/transactions/meta/spend_categories");
      return res.data;
    },
    staleTime: 60000, // 1 minute
  });
}


// Fetch unique accounts
export function useAccounts() {
  return useQuery<string[]>({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await client.get("/transactions/meta/metadata/accounts");
      return res.data;
    },
    staleTime: 60000, // 1 minute
  });
}


// Fetch date range metadata
export function useDateRange() {
  return useQuery<{ earliest: string | null; latest: string | null; has_data: boolean }>({
    queryKey: ["date_range"],
    queryFn: async () => {
      const res = await client.get("/transactions/meta/metadata/date-range");
      return res.data;
    },
    staleTime: 300000, // 5 minutes
  });
}


// ---------------------
// TRANSACTION QUERIES
// ---------------------


// Fetch all transactions (no filters)
export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await client.get("/transactions");
      return res.data.transactions; // Backend returns { transactions: [...], count: N }
    },
    staleTime: 30000, // 30 seconds
  });
}


// Fetch filtered transactions - backend handles all filtering
export function useFilteredTransactions(filters: TransactionFilters, enabled: boolean = true) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "filtered", filters],
    queryFn: async () => {
      const params = buildFilterParams(filters);
      const res = await client.get(`/transactions/filter?${params.toString()}`);
      return res.data.transactions; // Backend returns { transactions: [...], count: N, pagination: {...} }
    },
    staleTime: 30000, // 30 seconds
    enabled: enabled, // Allow external control of when to fetch
  });
}


// ---------------------
// MUTATIONS (CREATE, UPDATE, DELETE)
// ---------------------


// Create a new transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (txn: CreateTransactionData) => {
      const res = await client.post("/transactions", txn);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spend_categories"] });
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["date_range"] });
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
      queryClient.invalidateQueries({ queryKey: ["spend_categories"] });
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
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
      queryClient.invalidateQueries({ queryKey: ["spend_categories"] });
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
    },
  });
}


// Bulk delete transactions
export function useBulkDeleteTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction_ids: number[]) => {
      const res = await client.post("/transactions/admin/bulk-delete", { transaction_ids });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spend_categories"] });
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
    },
  });
}


// Bulk update transactions
export function useBulkUpdateTransactions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { transaction_ids: number[]; update_data: Omit<UpdateTransactionData, 'id'> }) => {
      const res = await client.post("/transactions/admin/bulk-update", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spend_categories"] });
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
    },
  });
}
