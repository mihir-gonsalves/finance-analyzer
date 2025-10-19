// frontend/src/components/filters/SearchFilter.tsx
import { TextField } from "@mui/material";


interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
}


export function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <TextField
      label="Search descriptions"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      placeholder="Search by description, account, or category"
    />
  );
}
