// frontend/src/components/filters/AccountFilter.tsx - multi-select dropdown for accounts
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";


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
        onChange={(e) => {
          const newValue = typeof e.target.value === 'string'
            ? e.target.value.split(',')
            : e.target.value;
          onChange(newValue);
        }}
        renderValue={(selected) =>
          selected.length === 0 ? (
            <Box sx={{ color: 'text.secondary' }}>All Accounts</Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )
        }
      >
        {options.map((account) => (
          <MenuItem key={account} value={account}>
            {account}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
