// frontend/src/components/filters/SpendCategoryFilter.tsx
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { MultiSelectChips, parseMultiSelectValue } from "../../utils/selectUtils";

interface SpendCategoryOption {
  id: number;
  name: string;
}

interface SpendCategoryFilterProps {
  value: number[];
  options: SpendCategoryOption[];
  onChange: (value: number[]) => void;
}

export function SpendCategoryFilter({ value, options, onChange }: SpendCategoryFilterProps) {
  const getLabel = (id: string | number) =>
    options.find(opt => opt.id === Number(id))?.name || String(id);

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Spend Categories</InputLabel>
      <Select
        multiple
        value={value}
        label="Spend Categories"
        onChange={(e) => onChange(parseMultiSelectValue(e.target.value))}
        renderValue={(selected) => (
          <MultiSelectChips
            selected={selected}
            getLabel={getLabel}
            placeholder="All Spend Categories"
          />
        )}
      >
        {options.map((sc) => (
          <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
