// frontend/src/components/filters/SpendCategoryFilter.tsx - multi-select dropdown for spend categories
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";


interface SpendCategoryOption {
  id: number;
  name: string;
  cost_center_id?: number;
}


interface SpendCategoryFilterProps {
  value: number[];
  options: SpendCategoryOption[];
  onChange: (value: number[]) => void;
}


export function SpendCategoryFilter({ value, options, onChange }: SpendCategoryFilterProps) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Spend Categories</InputLabel>
      <Select
        multiple
        value={value}
        label="Spend Categories"
        onChange={(e) => {
          const newValue = typeof e.target.value === 'string'
            ? [parseInt(e.target.value)]
            : e.target.value;
          onChange(newValue);
        }}
        renderValue={(selected) =>
          selected.length === 0 ? (
            <Box sx={{ color: 'text.secondary' }}>All Spend Categories</Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((id) => {
                const option = options.find(opt => opt.id === id);
                return option ? (
                  <Chip key={id} label={option.name} size="small" />
                ) : null;
              })}
            </Box>
          )
        }
      >
        {options.map((spendCategory) => (
          <MenuItem key={spendCategory.id} value={spendCategory.id}>
            {spendCategory.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
