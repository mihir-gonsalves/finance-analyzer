// frontend/src/components/transactions/TransactionDataGrid.tsx
import { useMemo } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";
import { formatDateString } from "../../utils/dateUtils";
import type { Transaction } from "../../hooks/useTransactions";

interface TransactionDataGridProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionDataGrid({
  transactions,
  isLoading,
  onEdit,
  onDelete,
}: TransactionDataGridProps) {
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (value: string) => formatDateString(value),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'categories',
      headerName: 'Categories',
      width: 200,
      renderCell: (params) => {
        const categories = params.value || [];
        if (categories.length === 0) {
          return <Chip label="Uncategorized" size="small" variant="outlined" color="default" />;
        }
        return (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {categories.map((category: { id: number; name: string }) => (
              <Chip
                key={category.id}
                label={category.name}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        );
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
          onClick={() => onEdit(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete sx={{ color: 'error.main' }} />}
          label="Delete"
          onClick={() => onDelete(params.row.id)}
        />,
      ],
    },
  ], [onEdit, onDelete]);

  return (
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
        '& .MuiDataGrid-cell': {
          display: 'flex',
          alignItems: 'center',
        },
      }}
      disableRowSelectionOnClick
    />
  );
}