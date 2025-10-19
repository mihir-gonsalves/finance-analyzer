// frontend/src/components/filters/AmountRangeFilter.tsx
import { TextField } from "@mui/material";


interface AmountRangeFilterProps {
  minAmount: string;
  maxAmount: string;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
}


export function AmountRangeFilter({
  minAmount,
  maxAmount,
  onMinAmountChange,
  onMaxAmountChange,
}: AmountRangeFilterProps) {
  return (
    <>
      <TextField
        label="Min Amount"
        type="number"
        value={minAmount}
        onChange={(e) => onMinAmountChange(e.target.value)}
        size="small"
        helperText="Negative for expenses"
        fullWidth
      />

      <TextField
        label="Max Amount"
        type="number"
        value={maxAmount}
        onChange={(e) => onMaxAmountChange(e.target.value)}
        size="small"
        helperText="Positive for income"
        fullWidth
      />
    </>
  );
}
