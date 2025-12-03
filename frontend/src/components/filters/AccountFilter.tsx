// frontend/src/components/filters/AccountFilter.tsx
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { MultiSelectChips, parseMultiSelectValue } from "../../utils/selectUtils";

interface AccountFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

export function AccountFilter({ value, options, onChange }: AccountFilterProps) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Accounts</InputLabel>
      <Select
        multiple
        value={value}
        label="Accounts"
        onChange={(e) => onChange(parseMultiSelectValue(e.target.value))}
        renderValue={(selected) => (
          <MultiSelectChips 
            selected={selected} 
            getLabel={(val) => String(val)} 
            placeholder="All Accounts" 
          />
        )}
      >
        {options.map((account) => (
          <MenuItem key={account} value={account}>{account}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
