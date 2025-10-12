// frontend/src/components/transactions/dialogs/EditTransactionDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import type { Transaction, UpdateTransactionData } from "../../../hooks/useTransactions";

interface EditTransactionDialogProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (data: UpdateTransactionData) => void;
  isLoading?: boolean;
}

export function EditTransactionDialog({
  open,
  transaction,
  onClose,
  onSave,
  isLoading = false,
}: EditTransactionDialogProps) {
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [categoryInput, setCategoryInput] = useState("");

  useEffect(() => {
    if (transaction) {
      setEditData(transaction);
      setCategoryInput(transaction.categories?.map(cat => cat.name).join(", ") || "");
    }
  }, [transaction]);

  const handleClose = () => {
    setEditData({});
    setCategoryInput("");
    onClose();
  };

  const handleSave = () => {
    if (!transaction) return;
    
    const updateData: UpdateTransactionData = {
      id: transaction.id,
      date: editData.date,
      description: editData.description,
      amount: editData.amount,
      account: editData.account,
      category_names: categoryInput
        ? categoryInput.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0)
        : []
    };
    
    onSave(updateData);
    handleClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Transaction</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Description"
            value={editData.description || ""}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Amount"
            type="number"
            value={editData.amount || ""}
            onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            fullWidth
          />
          <TextField
            label="Account"
            value={editData.account || ""}
            onChange={(e) => setEditData(prev => ({ ...prev, account: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Categories (comma-separated)"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            fullWidth
            placeholder="e.g. restaurants, miami"
            helperText="Enter multiple categories separated by commas"
            multiline
            maxRows={3}
          />
          <TextField
            label="Date"
            type="date"
            value={editData.date || ""}
            onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
