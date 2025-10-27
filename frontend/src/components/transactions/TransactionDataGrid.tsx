// frontend/src/components/transactions/TransactionDataGrid.tsx - MUI DataGrid ledger showing transaction rows
import { useMemo } from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { Box, Chip, Typography, Tooltip } from "@mui/material";
import { formatDateString } from "../../utils/dateUtils";
import type { Transaction, SpendCategory } from "../../hooks/useTransactions";
import { layoutStyles, commonStyles, combineStyles } from "../../styles";


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
      width: 115,
      renderCell: (params) => {
        const formattedDate = formatDateString(params.value);
        return (
          <Tooltip title={formattedDate} placement="top-start">
            <Typography>
              {formattedDate}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
      renderCell: (params) => {
        const description = params.value as string;
        return (
          <Tooltip title={description} placement="top-start">
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {description}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'categories',
      headerName: 'Categories',
      width: 300,
      renderCell: (params) => {
        const transaction = params.row as Transaction;
        const costCenter = transaction.cost_center;
        const spendCategories: SpendCategory[] = transaction.spend_categories || [];

        if (!costCenter && spendCategories.length === 0) {
          return <Chip label="Uncategorized" size="small" sx={commonStyles.chip.default} />;
        }

        const allCategories = [
          ...(costCenter ? [costCenter.name] : []),
          ...spendCategories.map(cat => cat.name)
        ];
        const tooltipText = allCategories.join(', ');

        return (
          <Tooltip title={tooltipText} placement="top-start">
            <Box sx={{ ...layoutStyles.flex.row, gap: 0.75, flexWrap: 'nowrap', overflow: 'hidden', width: '100%' }}>
              {costCenter && (
                <Chip
                  label={costCenter.name}
                  size="small"
                  sx={combineStyles(
                    commonStyles.chip.default,
                    commonStyles.chip.category,
                    {
                      color: 'secondary.main',
                      borderColor: 'secondary.main',
                    }
                  )}
                />
              )}
              {spendCategories.slice(0, 2).map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  sx={combineStyles(
                    commonStyles.chip.default,
                    commonStyles.chip.category
                  )}
                />
              ))}
              {spendCategories.length > 2 && (
                <Chip
                  label={`+${spendCategories.length - 2}`}
                  size="small"
                  sx={commonStyles.chip.default}
                />
              )}
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 110,
      renderCell: (params) => (
        <Box sx={layoutStyles.flex.row}>
          <Typography
            sx={{
              color: params.value < 0 ? 'error.main' : 'success.main',
              fontWeight: 'medium'
            }}
          >
            {params.value < 0 ? '-' : '+'}{formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'account',
      headerName: 'Account',
      width: 108,
      renderCell: (params) => {
        const account = params.value as string;
        return (
          <Tooltip title={account} placement="top-start">
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {account}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit sx={{ color: 'primary.main' }} />}
          label="Edit"
          onClick={() => onEdit(params.row)}
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
      sx={layoutStyles.dataDisplay.table}
      disableRowSelectionOnClick
      disableColumnMenu
    />
  );
}
