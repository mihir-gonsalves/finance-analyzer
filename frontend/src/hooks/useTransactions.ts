import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

export interface Transaction {
  id: number;
  date: string;
  description: string;
  category?: string;
  amount: number;
  account: string;
}

export interface CreateTransactionData {
  date: string;
  description: string;
  category?: string;
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

// Update a transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (txn: Transaction) => {
      const res = await client.put(`/transactions/${txn.id}`, txn);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}