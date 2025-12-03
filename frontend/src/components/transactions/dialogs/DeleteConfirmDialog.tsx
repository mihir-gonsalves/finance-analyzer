// frontend/src/components/transactions/dialogs/DeleteConfirmDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { commonStyles } from "../../../styles";

// ========================
// TYPE DEFINITIONS
// ========================

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

// ========================
// CONSTANTS
// ========================

const TEXT = {
  TITLE: "Delete Transaction",
  MESSAGE: "Are you sure you want to delete this transaction? This action cannot be undone.",
  CANCEL: "Cancel",
  CONFIRM: "Delete",
  LOADING: "Deleting...",
} as const;

const ICON_SIZE = 20;

// ========================
// MAIN COMPONENT
// ========================

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={commonStyles.dialog.title}>
        <DeleteForever sx={{ fontSize: ICON_SIZE }} />
        {TEXT.TITLE}
      </DialogTitle>

      <DialogContent sx={commonStyles.dialog.content}>
        <Typography>
          {TEXT.MESSAGE}
        </Typography>
      </DialogContent>

      <DialogActions sx={commonStyles.dialog.actions}>
        <Button onClick={onClose}>
          {TEXT.CANCEL}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? TEXT.LOADING : TEXT.CONFIRM}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
