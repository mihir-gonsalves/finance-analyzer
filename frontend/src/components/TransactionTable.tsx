// frontend/src/components/TransactionTable.tsx
import { useState, useRef } from "react";
import { Card, CardContent, Box, Alert } from "@mui/material";
import { useDeleteTransaction, useUpdateTransaction, useCreateTransaction, type Transaction, type CreateTransactionData, type UpdateTransactionData, } from "../hooks/useTransactions";
import { useCSVUpload } from "../hooks/useCSVUpload";
import { TransactionTableHeader } from "./transactions/TransactionTableHeader";
import { TransactionDataGrid } from "./transactions/TransactionDataGrid";
import { AddTransactionDialog } from "./transactions/dialogs/AddTransactionDialog";
import { EditTransactionDialog } from "./transactions/dialogs/EditTransactionDialog";
import { DeleteConfirmDialog } from "./transactions/dialogs/DeleteConfirmDialog";
import { CSVUploadDialog } from "./transactions/dialogs/CSVUploadDialog";
import LedgerChart from "./LedgerChart";
import type { TransactionFilters } from "../types/filters";
import { useTransactionData } from "../context/TransactionContext";


type ViewMode = 'table' | 'chart';


interface TransactionTableProps {
  filters: TransactionFilters;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}


export default function TransactionTable({ filters, filtersOpen, onToggleFilters }: TransactionTableProps) {
  // Data hooks
  const { transactions: filteredTransactions, isLoading, error } = useTransactionData();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  const createMutation = useCreateTransaction();
  const csvUploadMutation = useCSVUpload();

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvInstitution, setCsvInstitution] = useState("");

  // Handlers
  const handleAddTransaction = () => {
    setAddDialogOpen(true);
  };

  const handleSaveAdd = (transaction: CreateTransactionData) => {
    createMutation.mutate(transaction);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const handleSaveEdit = (data: UpdateTransactionData) => {
    updateMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    setDeleteTransactionId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteTransactionId) {
      deleteMutation.mutate(deleteTransactionId, {
        onSuccess: () => setDeleteTransactionId(null),
      });
    }
  };

  const handleCSVUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file?.name.endsWith('.csv')) {
      setCsvFile(file);
      setCsvInstitution("");
    } else {
      alert('Please select a CSV file');
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleCSVSubmit = () => {
    if (!csvFile || !csvInstitution) return;

    csvUploadMutation.mutate(
      { file: csvFile, institution: csvInstitution },
      {
        onSuccess: (data) => {
          setCsvFile(null);
          setCsvInstitution("");
          alert(`Successfully loaded ${data.message}`);
        },
        onError: (error: any) => {
          alert(`Upload failed: ${error.response?.data?.detail || error.message}`);
        }
      }
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            Error loading transactions. Please check your connection.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <TransactionTableHeader
            viewMode={viewMode}
            filters={filters}
            filtersOpen={filtersOpen}
            onToggleView={() => setViewMode(prev => prev === 'table' ? 'chart' : 'table')}
            onToggleFilters={onToggleFilters}
            onAddTransaction={handleAddTransaction}
            onCSVUpload={handleCSVUploadClick}
          />

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            style={{ display: 'none' }}
          />

          {viewMode === 'table' ? (
            <Box sx={{ height: 560 }}>
              <TransactionDataGrid
                transactions={filteredTransactions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
          ) : (
            <Box sx={{ height: 560 }}>
              <LedgerChart />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTransactionDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleSaveAdd}
        isLoading={createMutation.isPending}
      />

      <EditTransactionDialog
        open={!!editTransaction}
        transaction={editTransaction}
        onClose={() => setEditTransaction(null)}
        onSave={handleSaveEdit}
        isLoading={updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteTransactionId}
        onClose={() => setDeleteTransactionId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      <CSVUploadDialog
        open={!!csvFile}
        file={csvFile}
        institution={csvInstitution}
        onClose={() => {
          setCsvFile(null);
          setCsvInstitution("");
        }}
        onInstitutionChange={setCsvInstitution}
        onSubmit={handleCSVSubmit}
        isLoading={csvUploadMutation.isPending}
      />
    </>
  );
}
