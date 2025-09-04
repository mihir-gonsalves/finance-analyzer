import type { GridColDef } from "@mui/x-data-grid";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import { useTransactions, useDeleteTransaction } from "../hooks/useTransactions";


export default function TransactionTable() {
  const { data, isLoading, isError } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const columns: GridColDef[] = [
    { field: "description", headerName: "Description", flex: 1 },
    { field: "amount", headerName: "Amount", flex: 1, type: "number" },
    { field: "account", headerName: "Account", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={() => handleDelete(params.row.id)} color="error">
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong</p>;

  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={data || []}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        disableRowSelectionOnClick
      />
    </div>
  );
}
