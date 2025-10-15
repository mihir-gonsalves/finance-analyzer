// frontend/src/components/transactions/dialogs/CSVUploadDialog.tsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Alert, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, } from "@mui/material";
import { FileUpload, Upload } from "@mui/icons-material";

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
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <FileUpload />
          Upload CSV File
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          <Alert severity="info">
            Upload transaction history from your bank or credit card. Currently supported: Discover Credit Card and Schwab Checking Account.
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
              <MenuItem value="discover">Discover Credit Card</MenuItem>
              <MenuItem value="schwab">Schwab Checking Account</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="warning">
            Make sure your CSV file matches the expected format for the selected institution. Duplicate transactions may be created if you upload the same file multiple times.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
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
