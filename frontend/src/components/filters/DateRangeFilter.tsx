// frontend/src/components/filters/DateRangeFilter.tsx
import { TextField } from "@mui/material";

// ========================
// TYPE DEFINITIONS
// ========================

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

// ========================
// CONSTANTS
// ========================

const FIELD_CONFIG = {
  FROM: {
    LABEL: "From Date",
  },
  TO: {
    LABEL: "To Date",
  },
} as const;

const FIELD_PROPS = {
  TYPE: "date",
  SIZE: "small" as const,
  FULL_WIDTH: true,
  INPUT_LABEL_PROPS: { shrink: true },
} as const;

// ========================
// MAIN COMPONENT
// ========================

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <>
      <TextField
        label={FIELD_CONFIG.FROM.LABEL}
        type={FIELD_PROPS.TYPE}
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        InputLabelProps={FIELD_PROPS.INPUT_LABEL_PROPS}
        size={FIELD_PROPS.SIZE}
        fullWidth={FIELD_PROPS.FULL_WIDTH}
      />

      <TextField
        label={FIELD_CONFIG.TO.LABEL}
        type={FIELD_PROPS.TYPE}
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        InputLabelProps={FIELD_PROPS.INPUT_LABEL_PROPS}
        size={FIELD_PROPS.SIZE}
        fullWidth={FIELD_PROPS.FULL_WIDTH}
      />
    </>
  );
}
