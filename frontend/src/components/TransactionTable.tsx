//components/TransactionTable.tsx
import { useState, useRef, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Menu,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Edit, Delete, Add, MoreVert, Upload, FileUpload, TableChart, ShowChart, FilterList, Category, AccountBalance, CalendarMonth } from "@mui/icons-material";

import {
  useTransactions,
  useFilteredTransactions,
  useDeleteTransaction,
  useUpdateTransaction,
  useCreateTransaction,
  type Transaction,
  type CreateTransactionData
} from "../hooks/useTransactions";
import { useCSVUpload } from "../hooks/useCSVUpload";
import LedgerChart from "./LedgerChart";
import type { FilterState } from "../types/filters";

// Constants
const INITIAL_TRANSACTION_DATA: CreateTransactionData = {
  date: new Date().toISOString().split('T')[0],
  description: "",
  category: "",
  amount: 0,
  account: "",
};

const CSV_INITIAL_STATE = {
  open: false,
  file: null,
  institution: "",
} as const;

// Types
type ViewMode = 'table' | 'chart';

interface EditDialogState {
  open: boolean;
  transaction: Transaction | null;
}

interface DeleteDialogState {
  open: boolean;
  transactionId: number | null;
}

interface AddDialogState {
  open: boolean;
  transaction: CreateTransactionData;
}

interface CSVDialogState {
  open: boolean;
  file: File | null;
  institution: string;
}

interface TransactionTableProps {
  filters: FilterState;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

export default function TransactionTable({ filters, filtersOpen, onToggleFilters }: TransactionTableProps) {
  // Hooks
  const { data: allTransactions = [], error } = useTransactions();
  const { data: filteredTransactions = [], isLoading } = useFilteredTransactions(filters);
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  const createMutation = useCreateTransaction();
  const csvUploadMutation = useCSVUpload();

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    transaction: null,
  });

  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    transactionId: null,
  });

  const [addDialog, setAddDialog] = useState<AddDialogState>({
    open: false,
    transaction: INITIAL_TRANSACTION_DATA,
  });

  const [csvDialog, setCsvDialog] = useState<CSVDialogState>(CSV_INITIAL_STATE);

  // Utility functions
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  }, []);

  const formatDate = useCallback((dateStr: string): string => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }, []);

  // Event handlers
  const handleEdit = useCallback((transaction: Transaction) => {
    setEditDialog({ open: true, transaction });
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editDialog.transaction) return;
    
    updateMutation.mutate(editDialog.transaction, {
      onSuccess: () => {
        setEditDialog({ open: false, transaction: null });
      }
    });
  }, [editDialog.transaction, updateMutation]);

  const handleDelete = useCallback((id: number) => {
    setDeleteDialog({ open: true, transactionId: id });
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteDialog.transactionId) return;
    
    deleteMutation.mutate(deleteDialog.transactionId, {
      onSuccess: () => {
        setDeleteDialog({ open: false, transactionId: null });
      }
    });
  }, [deleteDialog.transactionId, deleteMutation]);

  const handleAddTransaction = useCallback(() => {
    setMenuAnchor(null);
    setAddDialog({
      open: true,
      transaction: { ...INITIAL_TRANSACTION_DATA },
    });
  }, []);

  const handleSaveAdd = useCallback(() => {
    const { description, account, amount } = addDialog.transaction;
    
    // Validation
    if (!description || !account || amount === 0) {
      return;
    }
    
    createMutation.mutate(addDialog.transaction, {
      onSuccess: () => {
        setAddDialog({
          open: false,
          transaction: { ...INITIAL_TRANSACTION_DATA },
        });
      }
    });
  }, [addDialog.transaction, createMutation]);

  const handleCSVUpload = useCallback(() => {
    setMenuAnchor(null);
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file?.name.endsWith('.csv')) {
      setCsvDialog({
        open: true,
        file,
        institution: "",
      });
    } else {
      alert('Please select a CSV file');
    }
    
    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  const handleCSVSubmit = useCallback(() => {
    if (!csvDialog.file || !csvDialog.institution) return;
    
    csvUploadMutation.mutate(
      { file: csvDialog.file, institution: csvDialog.institution },
      {
        onSuccess: (data) => {
          setCsvDialog(CSV_INITIAL_STATE);
          alert(`Successfully loaded ${data.message}`);
        },
        onError: (error: any) => {
          alert(`Upload failed: ${error.response?.data?.detail || error.message}`);
        }
      }
    );
  }, [csvDialog, csvUploadMutation]);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const toggleView = useCallback(() => {
    setViewMode(prev => prev === 'table' ? 'chart' : 'table');
  }, []);

  // Dialog close handlers
  const closeEditDialog = useCallback(() => {
    setEditDialog({ open: false, transaction: null });
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteDialog({ open: false, transactionId: null });
  }, []);

  const closeAddDialog = useCallback(() => {
    setAddDialog({ open: false, transaction: addDialog.transaction });
  }, [addDialog.transaction]);

  const closeCsvDialog = useCallback(() => {
    setCsvDialog(CSV_INITIAL_STATE);
  }, []);

  // Update handlers for dialogs
  const updateAddTransaction = useCallback((updates: Partial<CreateTransactionData>) => {
    setAddDialog(prev => ({
      ...prev,
      transaction: { ...prev.transaction, ...updates },
    }));
  }, []);

  const updateEditTransaction = useCallback((updates: Partial<Transaction>) => {
    setEditDialog(prev => ({
      ...prev,
      transaction: prev.transaction ? { ...prev.transaction, ...updates } : null,
    }));
  }, []);

  const updateCsvDialog = useCallback((updates: Partial<CSVDialogState>) => {
    setCsvDialog(prev => ({ ...prev, ...updates }));
  }, []);

  // Get active filter tags
  const getActiveFilterTags = useCallback(() => {
    const tags = [];

    if (filters.accounts.length > 0) {
      tags.push(
        <Chip
          key="accounts"
          icon={<AccountBalance />}
          label={filters.accounts.length === 1 ? filters.accounts[0] : `${filters.accounts.length} accounts`}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    if (filters.categories.length > 0) {
      tags.push(
        <Chip
          key="categories"
          icon={<Category />}
          label={filters.categories.length === 1 ? filters.categories[0] : `${filters.categories.length} categories`}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    if (filters.dateFrom || filters.dateTo) {
      tags.push(
        <Chip
          key="dates"
          icon={<CalendarMonth />}
          label={`Dates: ${filters.dateFrom || '...'} to ${filters.dateTo || '...'}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    if (filters.searchTerm) {
      tags.push(
        <Chip
          key="search"
          label={`Description: "${filters.searchTerm}"`}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    if (filters.minAmount || filters.maxAmount) {
      tags.push(
        <Chip
          key="amount"
          label={`Amount: $${filters.minAmount || '...'} to $${filters.maxAmount || '...'}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    return tags;
  }, [filters]);

  // DataGrid columns - memoized for performance with fixed alignment
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (value: string) => formatDate(value),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => {
        if (!params.value) {
          return <Chip label="Uncategorized" size="small" variant="outlined" color="default" />;
        }
        return <Chip label={params.value} size="small" color="primary" />;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography
            sx={{ 
              color: params.value < 0 ? 'error.main' : 'success.main'
            }}
            fontWeight="medium"
          >
            {params.value < 0 ? '-' : '+'}{formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'account',
      headerName: 'Account',
      width: 130,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete sx={{ color: 'error.main' }} />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ], [formatDate, formatCurrency, handleEdit, handleDelete]);

  // Error state
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button
              onClick={toggleView}
              sx={{
                color: 'text.primary',
                textTransform: 'none',
                fontSize: '1.25rem',
                fontWeight: 600,
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'primary.main',
                },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {viewMode === 'table' ? <TableChart /> : <ShowChart />}
              {viewMode === 'table' ? 'Ledger' : 'Chart'}
            </Button>
            
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              {/* Active Filter Tags */}
              {getActiveFilterTags().map(tag => tag)}

              <Button
                variant={filtersOpen ? "contained" : "outlined"}
                startIcon={<FilterList />}
                onClick={onToggleFilters}
                sx={{ mr: 1 }}
              >
                Filters
              </Button>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddTransaction}
              >
                Add Transaction
              </Button>

              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <MoreVert />
              </IconButton>
              
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={handleCSVUpload}>
                  <Upload sx={{ mr: 1 }} />
                  Upload CSV
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            style={{ display: 'none' }}
          />

          {viewMode === 'table' ? (
            <DataGrid
              rows={filteredTransactions}
              columns={columns}
              loading={isLoading}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [{ field: 'date', sort: 'desc' }],
                },
              }}
              sx={{
                height: 600,
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
              disableRowSelectionOnClick
            />
          ) : (
            <Box sx={{ height: 600 }}>
              <LedgerChart filters={filters} />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CSV Upload Dialog */}
      <Dialog 
        open={csvDialog.open} 
        onClose={closeCsvDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <FileUpload />
            Upload CSV File
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            <Alert severity="info">
              Upload transaction history from your bank or credit card. Currently supported: Discover Credit Card and Schwab Checking Account.
            </Alert>
            
            {csvDialog.file && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Selected file:
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {csvDialog.file.name}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth required>
              <InputLabel>Institution</InputLabel>
              <Select
                value={csvDialog.institution}
                label="Institution"
                onChange={(e) => updateCsvDialog({ institution: e.target.value })}
              >
                <MenuItem value="discover">Discover Credit Card</MenuItem>
                <MenuItem value="schwab">Schwab Checking Account</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="warning">
              Make sure your CSV file matches the expected format for the selected institution. Duplicate transactions may be created if you upload the same file multiple times.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCsvDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleCSVSubmit}
            variant="contained"
            disabled={!csvDialog.file || !csvDialog.institution || csvUploadMutation.isPending}
            startIcon={csvUploadMutation.isPending ? <CircularProgress size={16} /> : <Upload />}
          >
            {csvUploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog 
        open={addDialog.open} 
        onClose={closeAddDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Description"
              value={addDialog.transaction.description}
              onChange={(e) => updateAddTransaction({ description: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Amount"
              type="number"
              value={addDialog.transaction.amount || ""}
              onChange={(e) => updateAddTransaction({ amount: Number(e.target.value) })}
              fullWidth
              required
              helperText="Use negative values for expenses, positive for income"
            />
            <TextField
              label="Account"
              value={addDialog.transaction.account}
              onChange={(e) => updateAddTransaction({ account: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Category"
              value={addDialog.transaction.category || ""}
              onChange={(e) => updateAddTransaction({ category: e.target.value })}
              fullWidth
              placeholder="Optional"
            />
            <TextField
              label="Date"
              type="date"
              value={addDialog.transaction.date}
              onChange={(e) => updateAddTransaction({ date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDialog}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveAdd} 
            variant="contained" 
            disabled={
              createMutation.isPending || 
              !addDialog.transaction.description || 
              !addDialog.transaction.account || 
              addDialog.transaction.amount === 0
            }
          >
            {createMutation.isPending ? 'Adding...' : 'Add Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={closeEditDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Description"
              value={editDialog.transaction?.description || ""}
              onChange={(e) => updateEditTransaction({ description: e.target.value })}
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={editDialog.transaction?.amount || ""}
              onChange={(e) => updateEditTransaction({ amount: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Account"
              value={editDialog.transaction?.account || ""}
              onChange={(e) => updateEditTransaction({ account: e.target.value })}
              fullWidth
            />
            <TextField
              label="Category"
              value={editDialog.transaction?.category || ""}
              onChange={(e) => updateEditTransaction({ category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={editDialog.transaction?.date ? editDialog.transaction.date.split('T')[0] : ""}
              onChange={(e) => updateEditTransaction({ date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained" 
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}