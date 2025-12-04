// frontend/src/components/transactions/dialogs/CSVUploadDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FileUpload, Upload } from "@mui/icons-material";
import { DIALOG_CONFIG, BUTTON_TEXT } from "../../../utils/dialogUtils";
import { commonStyles, layoutStyles } from "../../../styles";

interface CSVUploadDialogProps {
  open: boolean;
  file: File | null;
  institution: string;
  onClose: () => void;
  onInstitutionChange: (institution: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const INSTITUTIONS = {
  discover: {
    label: 'Discover Credit Card',
    format: 'Expected columns: Trans. Date, Description, Amount, Category',
  },
  schwab: {
    label: 'Schwab Checking Account',
    format: 'Expected columns: Date, Status, Type, CheckNumber, Description, Withdrawal, Deposit, RunningBalance',
  },
  custom: {
    label: 'Custom Export (from this app)',
    format: 'Expected columns: Date, Description, Amount, Account, Cost Center, Spend Categories (comma-separated)',
  },
};

export function CSVUploadDialog({
  open,
  file,
  institution,
  onClose,
  onInstitutionChange,
  onSubmit,
  isLoading = false,
}: CSVUploadDialogProps) {
  const selectedInst = INSTITUTIONS[institution as keyof typeof INSTITUTIONS];

  return (
    <Dialog open={open} onClose={onClose} maxWidth={DIALOG_CONFIG.MAX_WIDTH} fullWidth>
      <DialogTitle sx={commonStyles.dialog.title}>
        <FileUpload sx={{ fontSize: 20 }} />
        Upload CSV File
      </DialogTitle>

      <DialogContent sx={commonStyles.dialog.content}>
        <Box sx={layoutStyles.dialogLayout.form}>
          <Alert severity="info">
            Upload transaction history from your financial institution or a custom export.
          </Alert>

          {file && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected file:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {file.name}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth required>
            <InputLabel>Institution</InputLabel>
            <Select
              value={institution}
              label="Institution"
              onChange={(e) => onInstitutionChange(e.target.value)}
            >
              {Object.entries(INSTITUTIONS).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedInst && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              <strong>Format:</strong> {selectedInst.format}
            </Alert>
          )}

          <Alert severity="warning">
            {institution === 'custom' 
              ? 'Re-uploading edited transactions will create duplicates. Consider deleting the old transactions first.'
              : 'Duplicate transactions may be created if you upload the same file multiple times.'}
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={commonStyles.dialog.actions}>
        <Button onClick={onClose}>{BUTTON_TEXT.CANCEL}</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!file || !institution || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Upload />}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
