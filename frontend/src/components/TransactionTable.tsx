// frontend/src/components/TransactionTable.tsx
import { useState, useRef } from "react";
import { Card, CardContent, Box, Alert } from "@mui/material";
import Timeline from "./Timeline";
import MoMBarChart from "./MoMBarChart";
import {
  useDeleteTransaction,
  useUpdateTransaction,
  useCreateTransaction,
  type Transaction,
  type CreateTransactionData,
  type UpdateTransactionData,
} from "../hooks/useTransactions";
import { useCSVUpload } from "../hooks/useCSVUpload";
import { TransactionTableHeader } from "./transactions/TransactionTableHeader";
import { TransactionDataGrid } from "./transactions/TransactionDataGrid";
import { AddTransactionDialog } from "./transactions/dialogs/AddTransactionDialog";
import { EditTransactionDialog } from "./transactions/dialogs/EditTransactionDialog";
import { DeleteConfirmDialog } from "./transactions/dialogs/DeleteConfirmDialog";
import { CSVUploadDialog } from "./transactions/dialogs/CSVUploadDialog";
import type { TransactionFilters } from "../types/filters";
import { useTransactionData } from "../context/TransactionContext";
import { exportTransactionsToCSV } from "../utils/exportUtils";
import { commonStyles, layoutStyles } from "../styles";

type ViewMode = 'table' | 'timeline' | 'barchart';

interface TransactionTableProps {
  filters: TransactionFilters;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

export default function TransactionTable({
  filters,
  filtersOpen,
  onToggleFilters,
}: TransactionTableProps) {
  const { transactions: filteredTransactions, isLoading, error } = useTransactionData();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  const createMutation = useCreateTransaction();
  const csvUploadMutation = useCSVUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvInstitution, setCsvInstitution] = useState("");

  // View mode cycling
  const handleToggleView = () => {
    setViewMode(prev => {
      if (prev === 'table') return 'timeline';
      if (prev === 'timeline') return 'barchart';
      return 'table';
    });
  };

  // Transaction actions
  const handleAddTransaction = () => setAddDialogOpen(true);
  
  const handleSaveAdd = (transaction: CreateTransactionData) => {
    createMutation.mutate(transaction);
  };

  const handleEdit = (transaction: Transaction) => setEditTransaction(transaction);
  
  const handleSaveEdit = (data: UpdateTransactionData) => {
    updateMutation.mutate(data);
  };

  const handleDelete = (id: number) => setDeleteTransactionId(id);

  const handleConfirmDelete = () => {
    if (deleteTransactionId) {
      deleteMutation.mutate(deleteTransactionId, {
        onSuccess: () => setDeleteTransactionId(null),
      });
    }
  };

  // CSV upload
  const handleCSVUploadClick = () => fileInputRef.current?.click();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file?.name.endsWith('.csv')) {
      setCsvFile(file);
      setCsvInstitution("");
    } else {
      alert('Please select a CSV file');
    }

    // Reset input
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
        },
      }
    );
  };

  // Export
  const handleExportCSV = () => exportTransactionsToCSV(filteredTransactions);

  // Error state
  if (error) {
    return (
      <Card sx={commonStyles.card.default}>
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
      <Card sx={commonStyles.card.elevated}>
        <CardContent>
          {/* Header with controls */}
          <TransactionTableHeader
            viewMode={viewMode}
            filters={filters}
            filtersOpen={filtersOpen}
            onToggleView={handleToggleView}
            onToggleFilters={onToggleFilters}
            onAddTransaction={handleAddTransaction}
            onCSVUpload={handleCSVUploadClick}
            onExportCSV={handleExportCSV}
          />

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            style={{ display: 'none' }}
          />

          {/* View content */}
          {viewMode === 'table' && (
            <Box sx={layoutStyles.dataDisplay.chartContainer}>
              <TransactionDataGrid
                transactions={filteredTransactions}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Box>
          )}
          
          {viewMode === 'timeline' && (
            <Box sx={layoutStyles.dataDisplay.chartContainer}>
              <Timeline />
            </Box>
          )}
          
          {viewMode === 'barchart' && (
            <Box sx={layoutStyles.dataDisplay.chartContainer}>
              <MoMBarChart />
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
