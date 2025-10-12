// frontend/src/components/filters/CategoryFilter.tsx
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";

interface CategoryFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

export function CategoryFilter({ value, options, onChange }: CategoryFilterProps) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Categories</InputLabel>
      <Select
        multiple
        value={value}
        label="Categories"
        onChange={(e) => {
          const newValue = typeof e.target.value === 'string' 
            ? e.target.value.split(',') 
            : e.target.value;
          onChange(newValue);
        }}
        renderValue={(selected) =>
          selected.length === 0 ? (
            <Box sx={{ color: 'text.secondary' }}>All Categories</Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )
        }
      >
        <MenuItem value="Uncategorized">Uncategorized</MenuItem>
        {options.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
