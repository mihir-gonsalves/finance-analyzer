// frontend/src/components/filters/AmountRangeFilter.tsx - min/max amount input fields
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
        label="Minimum Amount"
        type="number"
        value={minAmount}
        onChange={(e) => onMinAmountChange(e.target.value)}
        size="small"
        helperText="Negative for expenses"
        fullWidth
      />

      <TextField
        label="Maximum Amount"
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
