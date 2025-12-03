// frontend/src/components/filters/SpendCategoryFilter.tsx
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";
import { layoutStyles, commonStyles } from "../../styles";
import { SPACING } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

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

// ========================
// CONSTANTS
// ========================

const LABELS = {
  INPUT: "Spend Categories",
  PLACEHOLDER: "All Spend Categories",
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================

const parseSelectValue = (value: string | number[]): number[] => {
  return typeof value === 'string' ? [parseInt(value)] : value;
};

const findOptionById = (
  options: SpendCategoryOption[],
  id: number
): SpendCategoryOption | undefined => {
  return options.find(opt => opt.id === id);
};

// ========================
// SUB-COMPONENTS
// ========================

interface RenderValueProps {
  selected: number[];
  options: SpendCategoryOption[];
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

export function SpendCategoryFilter({ value, options, onChange }: SpendCategoryFilterProps) {
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
        {options.map((spendCategory) => (
          <MenuItem key={spendCategory.id} value={spendCategory.id}>
            {spendCategory.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
