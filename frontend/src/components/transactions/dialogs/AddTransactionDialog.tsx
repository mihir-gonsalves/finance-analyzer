// frontend/src/components/transactions/dialogs/AddTransactionDialog.tsx
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import { getTodayDateString } from "../../../utils/dateUtils";
import { layoutStyles, commonStyles } from "../../../styles";
import { FONT_WEIGHT } from "../../../styles/constants";
import type { CreateTransactionData } from "../../../hooks/useTransactions";

// ========================
// TYPE DEFINITIONS
// ========================

interface AddTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (transaction: CreateTransactionData) => void;
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
  TITLE: "Add New Transaction",
  CANCEL: "Cancel",
  SUBMIT: "Add Transaction",
  LOADING: "Adding...",
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
  AMOUNT: "Use negative values for expenses",
  COST_CENTER: 'Leave blank for "Uncategorized"',
  SPEND_CATEGORIES: 'Leave blank for "Uncategorized"',
} as const;

const INITIAL_STATE: CreateTransactionData = {
  date: getTodayDateString(),
  description: "",
  spend_category_names: [],
  amount: 0,
  account: "",
};

const ICON_SIZE = 20;
const MULTILINE_MAX_ROWS = 3;

// ========================
// UTILITY FUNCTIONS
// ========================

const parseSpendCategories = (input: string): string[] => {
  if (!input.trim()) return [];
  return input
    .split(",")
    .map(cat => cat.trim())
    .filter(cat => cat.length > 0);
};

const isFormValid = (transaction: CreateTransactionData): boolean => {
  return !!(
    transaction.description &&
    transaction.account &&
    transaction.amount !== 0
  );
};

// ========================
// MAIN COMPONENT
// ========================

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
    const costCenterName = costCenterInput.trim();
    const spendCategoryNames = parseSpendCategories(spendCategoryInput);

    const finalTransaction: CreateTransactionData = {
      ...transaction,
      cost_center_name: costCenterName || undefined,
      spend_category_names: spendCategoryNames,
    };

    onSave(finalTransaction);
    handleClose();
  };

  const handleFieldChange = (field: keyof CreateTransactionData, value: any) => {
    setTransaction(prev => ({ ...prev, [field]: value }));
  };

  const isValid = isFormValid(transaction);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={DIALOG_CONFIG.MAX_WIDTH}
      fullWidth={DIALOG_CONFIG.FULL_WIDTH}
    >
      <DialogTitle sx={commonStyles.dialog.title}>
        <Add sx={{ fontSize: ICON_SIZE }} />
        {TEXT.TITLE}
      </DialogTitle>

      <DialogContent sx={commonStyles.dialog.content}>
        <Box sx={layoutStyles.dialogLayout.form}>
          {/* Description */}
          <TextField
            label={FIELD_LABELS.DESCRIPTION}
            value={transaction.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            fullWidth
            required
          />

          {/* Amount and Account Row */}
          <Box sx={layoutStyles.dialogLayout.formRow}>
            <TextField
              label={FIELD_LABELS.AMOUNT}
              type="number"
              value={transaction.amount || ""}
              onChange={(e) => handleFieldChange('amount', Number(e.target.value))}
              fullWidth
              required
              helperText={HELPER_TEXT.AMOUNT}
            />
            <TextField
              label={FIELD_LABELS.ACCOUNT}
              value={transaction.account}
              onChange={(e) => handleFieldChange('account', e.target.value)}
              fullWidth
              required
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
            value={transaction.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            required
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
          disabled={isLoading || !isValid}
        >
          {isLoading ? TEXT.LOADING : TEXT.SUBMIT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
