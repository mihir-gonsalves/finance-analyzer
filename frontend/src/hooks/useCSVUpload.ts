// frontend/src/hooks/useCSVUpload.ts - handles CSV file uploads with institution selection
import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

// ========================
// TYPE DEFINITIONS
// ========================

export interface CSVUploadData {
  file: File;
  institution: string;
}

export interface CSVUploadResponse {
  message: string;
  count: number;
  institution: string;
}

// ========================
// CONSTANTS
// ========================

const QUERY_KEYS = {
  TRANSACTIONS: "transactions",
  SPEND_CATEGORIES: "spend_categories",
  COST_CENTERS: "cost_centers",
  ACCOUNTS: "accounts",
  DATE_RANGE: "date_range",
  ANALYTICS: "analytics",
} as const;

const API_CONFIG = {
  ENDPOINT: '/transactions/upload-csv',
  CONTENT_TYPE: 'multipart/form-data',
} as const;

// ========================
// HOOK
// ========================

/**
 * Hook for uploading CSV files to the backend
 * Invalidates all transaction-related queries on success
 */
export function useCSVUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, institution }: CSVUploadData) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institution', institution);

      const res = await client.post(API_CONFIG.ENDPOINT, formData, {
        headers: {
          'Content-Type': API_CONFIG.CONTENT_TYPE,
        },
      });

      return res.data as CSVUploadResponse;
    },
    onSuccess: () => {
      // Invalidate all transaction-related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SPEND_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.COST_CENTERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DATE_RANGE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ANALYTICS] });
    },
  });
}
