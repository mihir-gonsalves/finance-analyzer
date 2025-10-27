// frontend/src/components/transactions/dialogs/DeleteConfirmDialog.tsx - confirmation dialog for deleting transactions
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { commonStyles } from "../../../styles";


interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}


export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={commonStyles.dialog.title}>
        <DeleteForever sx={{ fontSize: 20 }} />
        Delete Transaction
      </DialogTitle>
      <DialogContent sx={commonStyles.dialog.content}>
        <Typography>
          Are you sure you want to delete this transaction? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={commonStyles.dialog.actions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
