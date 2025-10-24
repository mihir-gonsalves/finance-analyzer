// frontend/src/components/transactions/dialogs/EditTransactionDialog.tsx - form for editing existing transactions
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
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
  const [costCenterInput, setCostCenterInput] = useState("");
  const [spendCategoryInput, setSpendCategoryInput] = useState("");

  useEffect(() => {
    if (transaction) {
      setEditData(transaction);

      // Extract cost center name (or empty string if Uncategorized)
      if (transaction.cost_center) {
        setCostCenterInput(transaction.cost_center.name === "Uncategorized" ? "" : transaction.cost_center.name);
      } else {
        setCostCenterInput("");
      }

      // Extract spend category names
      const spendCatNames = transaction.spend_categories?.filter(cat => cat.name !== "Uncategorized").map(cat => cat.name).join(", ") || "";
      setSpendCategoryInput(spendCatNames);
    }
  }, [transaction]);

  const handleClose = () => {
    setEditData({});
    setCostCenterInput("");
    setSpendCategoryInput("");
    onClose();
  };

  const handleSave = () => {
    if (!transaction) return;

    // ALWAYS include cost_center_name (even if empty string)
    const costCenterName = costCenterInput.trim();

    // Parse spend categories
    const spendCategoryNames = spendCategoryInput
      ? spendCategoryInput.split(",").map(cat => cat.trim()).filter(cat => cat.length > 0)
      : [];

    const updateData: UpdateTransactionData = {
      id: transaction.id,
      date: editData.date,
      description: editData.description,
      amount: editData.amount,
      account: editData.account,
      cost_center_name: costCenterName, // ALWAYS INCLUDE (empty string defaults to Uncategorized)
      spend_category_names: spendCategoryNames,
    };

    onSave(updateData as any);
    handleClose();
  };

  const formatAmount = (amount: number | string) => {
    if (typeof amount === "number") {
      return amount.toFixed(2);
    }
    return amount;
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
            value={formatAmount(editData.amount || "")}
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
