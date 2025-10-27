// frontend/src/components/transactions/dialogs/CSVUploadDialog.tsx - dialog for uploading CSV files from financial institutions
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, } from "@mui/material";
import { FileUpload, Upload } from "@mui/icons-material";
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


export function CSVUploadDialog({
  open,
  file,
  institution,
  onClose,
  onInstitutionChange,
  onSubmit,
  isLoading = false,
}: CSVUploadDialogProps) {
  const getFormatDescription = () => {
    switch (institution) {
      case 'discover':
        return 'Expected columns: Trans. Date, Description, Amount, Category';
      case 'schwab':
        return 'Expected columns: Date, Status, Type, CheckNumber, Description, Withdrawal, Deposit, RunningBalance';
      case 'custom':
        return 'Expected columns: Date, Description, Amount, Account, Cost Center, Spend Categories (comma-separated)';
      default:
        return 'Select an institution to see format requirements';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={commonStyles.dialog.title}>
        <FileUpload />
        Upload CSV File
      </DialogTitle>
      <DialogContent sx={commonStyles.dialog.content}>
        <Box sx={layoutStyles.dialogLayout.form}>
          <Alert severity="info">
            Upload transaction history from your bank, credit card, or a custom export from this app.
          </Alert>

          {file && (
            <Box>
              <Typography variant="body2" sx={commonStyles.typography.label} gutterBottom>
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
              <MenuItem value="discover">Discover Credit Card</MenuItem>
              <MenuItem value="schwab">Schwab Checking Account</MenuItem>
              <MenuItem value="custom">Custom Export (from this app)</MenuItem>
            </Select>
          </FormControl>

          {institution && (
            <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
              <strong>Format:</strong> {getFormatDescription()}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!file || !institution || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Upload />}
        >
          {isLoading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
