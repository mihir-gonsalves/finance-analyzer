import { useState } from "react";
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
} from "@mui/material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Edit, Delete, Add } from "@mui/icons-material";

import { useTransactions, useDeleteTransaction, useUpdateTransaction } from "../hooks/useTransactions";
import type { Transaction } from "../hooks/useTransactions";

export default function TransactionTable() {
  const { data: transactions = [], isLoading, error } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();
  
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    transaction: Transaction | null;
  }>({ open: false, transaction: null });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    transactionId: number | null;
  }>({ open: false, transactionId: null });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  // Format date
  const formatDate = (dateStr: string) => {
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
  };

  // Handle edit
  const handleEdit = (transaction: Transaction) => {
    setEditDialog({ open: true, transaction });
  };

  const handleSaveEdit = () => {
    if (!editDialog.transaction) return;
    
    updateMutation.mutate(editDialog.transaction, {
      onSuccess: () => {
        setEditDialog({ open: false, transaction: null });
      }
    });
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setDeleteDialog({ open: true, transactionId: id });
  };

  const confirmDelete = () => {
    if (!deleteDialog.transactionId) return;
    
    deleteMutation.mutate(deleteDialog.transactionId, {
      onSuccess: () => {
        setDeleteDialog({ open: false, transactionId: null });
      }
    });
  };

  // DataGrid columns
  const columns: GridColDef[] = [
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
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography
          sx={{ color: params.value < 0 ? 'error.main' : 'success.main' }}
          fontWeight="medium"
        >
          {params.value < 0 ? '-' : '+'}{formatCurrency(params.value)}
        </Typography>
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
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<Delete sx={{ color: 'error.main' }} />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

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
            <Typography variant="h6" component="h2">
              Transactions
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                // TODO: Add new transaction functionality
                console.log("Add new transaction");
              }}
            >
              Add Transaction
            </Button>
          </Box>

          <DataGrid
            rows={transactions}
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
            }}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, transaction: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Description"
              value={editDialog.transaction?.description || ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  transaction: prev.transaction ? { ...prev.transaction, description: e.target.value } : null,
                }))
              }
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={editDialog.transaction?.amount || ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  transaction: prev.transaction ? { ...prev.transaction, amount: Number(e.target.value) } : null,
                }))
              }
              fullWidth
            />
            <TextField
              label="Account"
              value={editDialog.transaction?.account || ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  transaction: prev.transaction ? { ...prev.transaction, account: e.target.value } : null,
                }))
              }
              fullWidth
            />
            <TextField
              label="Category"
              value={editDialog.transaction?.category || ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  transaction: prev.transaction ? { ...prev.transaction, category: e.target.value } : null,
                }))
              }
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={editDialog.transaction?.date ? editDialog.transaction.date.split('T')[0] : ""}
              onChange={(e) =>
                setEditDialog((prev) => ({
                  ...prev,
                  transaction: prev.transaction ? { ...prev.transaction, date: e.target.value } : null,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, transaction: null })}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={updateMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, transactionId: null })}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this transaction? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, transactionId: null })}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={deleteMutation.isPending}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}