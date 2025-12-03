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
import { commonStyles, layoutStyles } from "../../../styles";

// ========================
// TYPE DEFINITIONS
// ========================

interface CSVUploadDialogProps {
  open: boolean;
  file: File | null;
  institution: string;
  onClose: () => void;
  onInstitutionChange: (institution: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

type Institution = 'discover' | 'schwab' | 'custom' | '';

// ========================
// CONSTANTS
// ========================

const DIALOG_CONFIG = {
  MAX_WIDTH: "sm" as const,
  FULL_WIDTH: true,
} as const;

const TEXT = {
  TITLE: "Upload CSV File",
  CANCEL: "Cancel",
  SUBMIT: "Upload",
  LOADING: "Uploading...",
  INFO: "Upload transaction history from your financial institution of choice or a custom export from this app.",
  SELECTED_FILE: "Selected file:",
  INSTITUTION_LABEL: "Institution",
  FORMAT_PREFIX: "Format:",
  DEFAULT_FORMAT: "Select an institution to see format requirements",
} as const;

const INSTITUTIONS = {
  DISCOVER: {
    VALUE: 'discover',
    LABEL: 'Discover Credit Card',
    FORMAT: 'Expected columns: Trans. Date, Description, Amount, Category',
  },
  SCHWAB: {
    VALUE: 'schwab',
    LABEL: 'Schwab Checking Account',
    FORMAT: 'Expected columns: Date, Status, Type, CheckNumber, Description, Withdrawal, Deposit, RunningBalance',
  },
  CUSTOM: {
    VALUE: 'custom',
    LABEL: 'Custom Export (from this app)',
    FORMAT: 'Expected columns: Date, Description, Amount, Account, Cost Center, Spend Categories (comma-separated)',
  },
} as const;

const WARNINGS = {
  CUSTOM: 'Re-uploading edited transactions will create duplicates. Consider deleting the old transactions first.',
  DEFAULT: 'Duplicate transactions may be created if you upload the same file multiple times.',
} as const;

const ICON_SIZE = 20;
const PROGRESS_SIZE = 16;

// ========================
// UTILITY FUNCTIONS
// ========================

const getFormatDescription = (institution: Institution): string => {
  switch (institution) {
    case 'discover':
      return INSTITUTIONS.DISCOVER.FORMAT;
    case 'schwab':
      return INSTITUTIONS.SCHWAB.FORMAT;
    case 'custom':
      return INSTITUTIONS.CUSTOM.FORMAT;
    default:
      return TEXT.DEFAULT_FORMAT;
  }
};

const getWarningMessage = (institution: Institution): string => {
  return institution === 'custom' ? WARNINGS.CUSTOM : WARNINGS.DEFAULT;
};

// ========================
// SUB-COMPONENTS
// ========================

interface FileInfoProps {
  file: File;
}

function FileInfo({ file }: FileInfoProps) {
  return (
    <Box>
      <Typography variant="body2" sx={commonStyles.typography.label} gutterBottom>
        {TEXT.SELECTED_FILE}
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {file.name}
      </Typography>
    </Box>
  );
}

interface InstitutionSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function InstitutionSelect({ value, onChange }: InstitutionSelectProps) {
  return (
    <FormControl fullWidth required>
      <InputLabel>{TEXT.INSTITUTION_LABEL}</InputLabel>
      <Select
        value={value}
        label={TEXT.INSTITUTION_LABEL}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value={INSTITUTIONS.DISCOVER.VALUE}>
          {INSTITUTIONS.DISCOVER.LABEL}
        </MenuItem>
        <MenuItem value={INSTITUTIONS.SCHWAB.VALUE}>
          {INSTITUTIONS.SCHWAB.LABEL}
        </MenuItem>
        <MenuItem value={INSTITUTIONS.CUSTOM.VALUE}>
          {INSTITUTIONS.CUSTOM.LABEL}
        </MenuItem>
      </Select>
    </FormControl>
  );
}

interface FormatAlertProps {
  institution: Institution;
}

function FormatAlert({ institution }: FormatAlertProps) {
  if (!institution) return null;

  return (
    <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
      <strong>{TEXT.FORMAT_PREFIX}</strong> {getFormatDescription(institution)}
    </Alert>
  );
}

interface WarningAlertProps {
  institution: Institution;
}

function WarningAlert({ institution }: WarningAlertProps) {
  return (
    <Alert severity="warning">
      {getWarningMessage(institution)}
    </Alert>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function CSVUploadDialog({
  open,
  file,
  institution,
  onClose,
  onInstitutionChange,
  onSubmit,
  isLoading = false,
}: CSVUploadDialogProps) {
  const isSubmitDisabled = !file || !institution || isLoading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={DIALOG_CONFIG.MAX_WIDTH}
      fullWidth={DIALOG_CONFIG.FULL_WIDTH}
    >
      <DialogTitle sx={commonStyles.dialog.title}>
        <FileUpload sx={{ fontSize: ICON_SIZE }} />
        {TEXT.TITLE}
      </DialogTitle>

      <DialogContent sx={commonStyles.dialog.content}>
        <Box sx={layoutStyles.dialogLayout.form}>
          {/* Info Alert */}
          <Alert severity="info">
            {TEXT.INFO}
          </Alert>

          {/* File Info */}
          {file && <FileInfo file={file} />}

          {/* Institution Select */}
          <InstitutionSelect
            value={institution}
            onChange={onInstitutionChange}
          />

          {/* Format Alert */}
          <FormatAlert institution={institution as Institution} />

          {/* Warning Alert */}
          <WarningAlert institution={institution as Institution} />
        </Box>
      </DialogContent>

      <DialogActions sx={commonStyles.dialog.actions}>
        <Button onClick={onClose}>
          {TEXT.CANCEL}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={isLoading ? <CircularProgress size={PROGRESS_SIZE} /> : <Upload />}
        >
          {isLoading ? TEXT.LOADING : TEXT.SUBMIT}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
