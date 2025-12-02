// frontend/src/hooks/useCSVUpload.ts - handles CSV file uploads with institution selection
import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";


export interface CSVUploadData {
  file: File;
  institution: string; // e.g., 'discover', 'schwab', etc.
}


export interface CSVUploadResponse {
  message: string;
  count: number;
  institution: string;
}


/*
 * Hook for uploading CSV files to the backend
 * Backend endpoint: POST /transactions/meta/upload-csv
 */
export function useCSVUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, institution }: CSVUploadData) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('institution', institution);

      const res = await client.post('/transactions/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return res.data as CSVUploadResponse;
    },
    onSuccess: () => {
      // Invalidate all transaction-related queries after successful upload
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spend_categories"] });
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["date_range"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
