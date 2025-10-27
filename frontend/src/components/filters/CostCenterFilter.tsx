// frontend/src/components/filters/CostCenterFilter.tsx - multi-select dropdown for cost centers
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";
import { layoutStyles, commonStyles } from "../../styles";


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
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>Cost Centers</InputLabel>
      <Select
        multiple
        value={value}
        label="Cost Centers"
        onChange={(e) => {
          const newValue = typeof e.target.value === 'string'
            ? [parseInt(e.target.value)]
            : e.target.value;
          onChange(newValue);
        }}
        renderValue={(selected) =>
          selected.length === 0 ? (
            <Box sx={{ color: 'text.secondary' }}>All Cost Centers</Box>
          ) : (
            <Box sx={{ ...layoutStyles.flex.wrap, gap: 0.5 }}>
              {selected.map((id) => {
                const option = options.find(opt => opt.id === id);
                return option ? (
                  <Chip
                    key={id}
                    label={option.name}
                    size="small"
                    sx={commonStyles.chip.default}
                  />
                ) : null;
              })}
            </Box>
          )
        }
      >
        {options.map((costCenter) => (
          <MenuItem key={costCenter.id} value={costCenter.id}>
            {costCenter.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
