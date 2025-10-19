// frontend/src/components/filters/DateRangeFilter.tsx
import { TextField } from "@mui/material";


interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}


export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  return (
    <>
      <TextField
        label="From Date"
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
        fullWidth
      />

      <TextField
        label="To Date"
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        InputLabelProps={{ shrink: true }}
        size="small"
        fullWidth
      />
    </>
  );
}
