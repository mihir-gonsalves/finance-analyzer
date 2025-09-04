import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import client from "../api/client";


export interface Transaction {
  id: number;
  description: string;
  amount: number;
  account: string;
  category?: string;
  date?: string;
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


// Delete a transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      // invalidate cache so list refetches
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
