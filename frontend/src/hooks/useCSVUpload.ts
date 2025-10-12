// frontend/src/hooks/useCSVUpload.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

export interface CSVUploadData {
  file: File;
  institution: string;
}

export function useCSVUpload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, institution }: CSVUploadData) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institution", institution);
      
      const res = await client.post("/transactions/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}