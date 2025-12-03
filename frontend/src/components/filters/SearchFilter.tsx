// frontend/src/components/filters/SearchFilter.tsx
import { TextField } from "@mui/material";

// ========================
// TYPE DEFINITIONS
// ========================

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}

// ========================
// CONSTANTS
// ========================

const FIELD_CONFIG = {
  LABEL: "Search descriptions",
  PLACEHOLDER: "Search by description, account, or category",
  SIZE: "small" as const,
} as const;

// ========================
// MAIN COMPONENT
// ========================

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <TextField
      label={FIELD_CONFIG.LABEL}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size={FIELD_CONFIG.SIZE}
      fullWidth
      placeholder={FIELD_CONFIG.PLACEHOLDER}
    />
  );
}
