// frontend/src/components/transactions/dialogs/AddTransactionDialog.tsx - form for creating new transactions
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
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
  spend_category_names: [],
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
  const [costCenterInput, setCostCenterInput] = useState("");
  const [spendCategoryInput, setSpendCategoryInput] = useState("");

  const handleClose = () => {
    setTransaction(INITIAL_STATE);
    setCostCenterInput("");
    setSpendCategoryInput("");
    onClose();
  };

  const handleSave = () => {
    // Parse cost center and spend categories from input
    const costCenterName = costCenterInput.trim();
    const spendCategoryNames = spendCategoryInput
      ? spendCategoryInput.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0)
      : [];

    // Send to backend with the structure it expects
    const finalTransaction = {
      ...transaction,
      cost_center_name: costCenterName || undefined,
      spend_category_names: spendCategoryNames,
    };

    onSave(finalTransaction as any); // Backend will handle creation
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
            label="Cost Center"
            value={costCenterInput}
            onChange={(e) => setCostCenterInput(e.target.value)}
            fullWidth
            placeholder="e.g. Living Expenses, Car, Meals"
            helperText='Leave blank for "Uncategorized"'
          />

          <TextField
            label="Spend Categories (comma-separated)"
            value={spendCategoryInput}
            onChange={(e) => setSpendCategoryInput(e.target.value)}
            fullWidth
            placeholder="e.g. Rent, Gas, Groceries"
            helperText='Leave blank for "Uncategorized"'
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
