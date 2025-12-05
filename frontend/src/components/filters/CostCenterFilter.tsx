// frontend/src/components/filters/CostCenterFilter.tsx
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { MultiSelectChips, parseMultiSelectValue } from "../../utils/selectUtils";

interface CostCenterOption {
  id: number;
  name: string;
}

interface CostCenterFilterProps {
  value: number[];
  options: CostCenterOption[];
  onChange: (value: number[]) => void;
}

export function CostCenterFilter({ value, options, onChange }: CostCenterFilterProps) {
  const getLabel = (id: string | number) =>
    options.find(opt => opt.id === Number(id))?.name || String(id);

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Cost Centers</InputLabel>
      <Select
        multiple
        value={value}
        label="Cost Centers"
        onChange={(e) => onChange(parseMultiSelectValue(e.target.value))}
        renderValue={(selected) => (
          <MultiSelectChips
            selected={selected}
            getLabel={getLabel}
            placeholder="All Cost Centers"
          />
        )}
      >
        {options.map((cc) => (
          <MenuItem key={cc.id} value={cc.id}>{cc.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
