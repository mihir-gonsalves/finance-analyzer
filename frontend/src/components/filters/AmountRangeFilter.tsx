// frontend/src/components/filters/AmountRangeFilter.tsx
import { TextField } from "@mui/material";

// ========================
// TYPE DEFINITIONS
// ========================

interface AmountRangeFilterProps {
  minAmount: string;
  maxAmount: string;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
}

// ========================
// CONSTANTS
// ========================

const FIELD_CONFIG = {
  MIN: {
    LABEL: "Minimum Amount",
    HELPER_TEXT: "Negative for expenses",
  },
  MAX: {
    LABEL: "Maximum Amount",
    HELPER_TEXT: "Positive for income",
  },
} as const;

const FIELD_PROPS = {
  TYPE: "number",
  SIZE: "small" as const,
  FULL_WIDTH: true,
} as const;

// ========================
// MAIN COMPONENT
// ========================

export function AmountRangeFilter({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
}: AmountRangeFilterProps) {
  return (
    <>
      <TextField
        label={FIELD_CONFIG.MIN.LABEL}
        type={FIELD_PROPS.TYPE}
        value={minAmount}
        onChange={(e) => onMinAmountChange(e.target.value)}
        size={FIELD_PROPS.SIZE}
        helperText={FIELD_CONFIG.MIN.HELPER_TEXT}
        fullWidth={FIELD_PROPS.FULL_WIDTH}
      />

      <TextField
        label={FIELD_CONFIG.MAX.LABEL}
        type={FIELD_PROPS.TYPE}
        value={maxAmount}
        onChange={(e) => onMaxAmountChange(e.target.value)}
        size={FIELD_PROPS.SIZE}
        helperText={FIELD_CONFIG.MAX.HELPER_TEXT}
        fullWidth={FIELD_PROPS.FULL_WIDTH}
      />
    </>
  );
}
