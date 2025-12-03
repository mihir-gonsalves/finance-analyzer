// frontend/src/components/transactions/dialogs/EditTransactionDialog.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { layoutStyles, commonStyles } from "../../../styles";
import type { Transaction, UpdateTransactionData } from "../../../hooks/useTransactions";

// ========================
// TYPE DEFINITIONS
// ========================

interface EditTransactionDialogProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (data: UpdateTransactionData) => void;
  isLoading?: boolean;
}

// ========================
// CONSTANTS
// ========================

const DIALOG_CONFIG = {
  MAX_WIDTH: "sm" as const,
  FULL_WIDTH: true,
} as const;

const TEXT = {
  TITLE: "Edit Transaction",
  CANCEL: "Cancel",
  SUBMIT: "Save",
  LOADING: "Saving...",
} as const;

const FIELD_LABELS = {
  DESCRIPTION: "Description",
  AMOUNT: "Amount",
  ACCOUNT: "Account",
  COST_CENTER: "Cost Center",
  SPEND_CATEGORIES: "Spend Categories (comma-separated)",
  DATE: "Date",
} as const;

const PLACEHOLDERS = {
  COST_CENTER: "e.g. Living Expenses, Car, Meals",
  SPEND_CATEGORIES: "e.g. Rent, Gas, Groceries",
} as const;

const HELPER_TEXT = {
  COST_CENTER: 'Leave blank for "Uncategorized"',
  SPEND_CATEGORIES: 'Leave blank for "Uncategorized"',
} as const;

const UNCATEGORIZED = "Uncategorized";
const ICON_SIZE = 20;
const MULTILINE_MAX_ROWS = 3;
const AMOUNT_DECIMAL_PLACES = 2;

// ========================
// UTILITY FUNCTIONS
// ========================

const formatAmount = (amount: number | string): string => {
  if (typeof amount === "number") {
    return amount.toFixed(AMOUNT_DECIMAL_PLACES);
  }
  return amount;
};

const parseSpendCategories = (input: string): string[] => {
  if (!input.trim()) return [];
  return input
    .split(",")
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0);
};

const getCostCenterInput = (transaction: Transaction | null): string => {
  if (!transaction?.cost_center) return "";
  if (transaction.cost_center.name === UNCATEGORIZED) return "";
  return transaction.cost_center.name;
};

const getSpendCategoryInput = (transaction: Transaction | null): string => {
  if (!transaction?.spend_categories) return "";
  
  const names = transaction.spend_categories
    .filter(cat => cat.name !== UNCATEGORIZED)
    .map(cat => cat.name);
  
  return names.join(", ");
};

// ========================
// MAIN COMPONENT
// ========================

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

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setEditData(transaction);
      setCostCenterInput(getCostCenterInput(transaction));
      setSpendCategoryInput(getSpendCategoryInput(transaction));
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

    const costCenterName = costCenterInput.trim();
    const spendCategoryNames = parseSpendCategories(spendCategoryInput);

    const updateData: UpdateTransactionData = {
      id: transaction.id,
      date: editData.date,
      description: editData.description,
      amount: editData.amount,
      account: editData.account,
      cost_center_name: costCenterName,
      spend_category_names: spendCategoryNames,
    };

    onSave(updateData);
    handleClose();
  };

  const handleFieldChange = (field: keyof Transaction, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Don't render if no transaction
  if (!transaction) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={DIALOG_CONFIG.MAX_WIDTH}
      fullWidth={DIALOG_CONFIG.FULL_WIDTH}
    >
      <DialogTitle sx={commonStyles.dialog.title}>
        <Edit sx={{ fontSize: ICON_SIZE }} />
        {TEXT.TITLE}
      </DialogTitle>

      <DialogContent sx={commonStyles.dialog.content}>
        <Box sx={layoutStyles.dialogLayout.form}>
          {/* Description */}
          <TextField
            label={FIELD_LABELS.DESCRIPTION}
            value={editData.description || ""}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            fullWidth
          />

          {/* Amount and Account Row */}
          <Box sx={layoutStyles.dialogLayout.formRow}>
            <TextField
              label={FIELD_LABELS.AMOUNT}
              type="number"
              value={formatAmount(editData.amount || "")}
              onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
              fullWidth
            />
            <TextField
              label={FIELD_LABELS.ACCOUNT}
              value={editData.account || ""}
              onChange={(e) => handleFieldChange('account', e.target.value)}
              fullWidth
            />
          </Box>

          {/* Cost Center */}
          <TextField
            label={FIELD_LABELS.COST_CENTER}
            value={costCenterInput}
            onChange={(e) => setCostCenterInput(e.target.value)}
            fullWidth
            placeholder={PLACEHOLDERS.COST_CENTER}
            helperText={HELPER_TEXT.COST_CENTER}
          />

          {/* Spend Categories */}
          <TextField
            label={FIELD_LABELS.SPEND_CATEGORIES}
            value={spendCategoryInput}
            onChange={(e) => setSpendCategoryInput(e.target.value)}
            fullWidth
            placeholder={PLACEHOLDERS.SPEND_CATEGORIES}
            helperText={HELPER_TEXT.SPEND_CATEGORIES}
            multiline
            maxRows={MULTILINE_MAX_ROWS}
          />

          {/* Date */}
          <TextField
            label={FIELD_LABELS.DATE}
            type="date"
            value={editData.date || ""}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={commonStyles.dialog.actions}>
        <Button onClick={handleClose}>
          {TEXT.CANCEL}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? TEXT.LOADING : TEXT.SUBMIT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
