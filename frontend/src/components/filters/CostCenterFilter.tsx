// frontend/src/components/filters/CostCenterFilter.tsx
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";
import { layoutStyles, commonStyles } from "../../styles";
import { SPACING } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

interface CostCenterOption {
  id: number;
  name: string;
}

interface CostCenterFilterProps {
  value: number[];
  options: CostCenterOption[];
  onChange: (value: number[]) => void;
}

// ========================
// CONSTANTS
// ========================

const LABELS = {
  INPUT: "Cost Centers",
  PLACEHOLDER: "All Cost Centers",
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================

const parseSelectValue = (value: string | number[]): number[] => {
  return typeof value === 'string' ? [parseInt(value)] : value;
};

const findOptionById = (options: CostCenterOption[], id: number): CostCenterOption | undefined => {
  return options.find(opt => opt.id === id);
};

// ========================
// SUB-COMPONENTS
// ========================

interface RenderValueProps {
  selected: number[];
  options: CostCenterOption[];
}

function RenderValue({ selected, options }: RenderValueProps) {
  if (selected.length === 0) {
    return <Box sx={{ color: 'text.secondary' }}>{LABELS.PLACEHOLDER}</Box>;
  }

  return (
    <Box sx={{ ...layoutStyles.flex.wrap, gap: SPACING.xs }}>
      {selected.map((id) => {
        const option = findOptionById(options, id);
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
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function CostCenterFilter({ value, options, onChange }: CostCenterFilterProps) {
  const handleChange = (newValue: string | number[]) => {
    onChange(parseSelectValue(newValue));
  };

  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{LABELS.INPUT}</InputLabel>
      <Select
        multiple
        value={value}
        label={LABELS.INPUT}
        onChange={(e) => handleChange(e.target.value)}
        renderValue={(selected) => <RenderValue selected={selected} options={options} />}
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
