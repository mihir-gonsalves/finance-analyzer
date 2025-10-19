// frontend/src/components/transactions/dialogs/AddTransactionDialog.tsx
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, } from "@mui/material";
import { getTodayDateString } from "../../../utils/dateUtils";
import type { CreateTransactionData } from "../../../hooks/useTransactions";


interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: CreateTransactionData) => void;
  isLoading?: boolean;
}


const INITIAL_STATE: CreateTransactionData = {
  date: getTodayDateString(),
  description: "",
  category_names: [],
  amount: 0,
  account: "",
};


export function AddTransactionDialog({
  open,
  onClose,
  onSave,
  isLoading = false,
}: AddTransactionDialogProps) {
  const [transaction, setTransaction] = useState<CreateTransactionData>(INITIAL_STATE);
  const [categoryInput, setCategoryInput] = useState("");

  const handleClose = () => {
    setTransaction(INITIAL_STATE);
    setCategoryInput("");
    onClose();
  };

  const handleSave = () => {
    const finalTransaction = {
      ...transaction,
      category_names: categoryInput
        ? categoryInput.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0)
        : []
    };
    onSave(finalTransaction);
    handleClose();
  };

  const isValid = transaction.description && transaction.account && transaction.amount !== 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Transaction</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Description"
            value={transaction.description}
            onChange={(e) => setTransaction(prev => ({ ...prev, description: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Amount"
            type="number"
            value={transaction.amount || ""}
            onChange={(e) => setTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
            fullWidth
            required
            helperText="Use negative values for expenses, positive for income"
          />
          <TextField
            label="Account"
            value={transaction.account}
            onChange={(e) => setTransaction(prev => ({ ...prev, account: e.target.value }))}
            fullWidth
            required
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
            value={transaction.date}
            onChange={(e) => setTransaction(prev => ({ ...prev, date: e.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || !isValid}
        >
          {isLoading ? 'Adding...' : 'Add Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
