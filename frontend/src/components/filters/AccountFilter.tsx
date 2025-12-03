// frontend/src/components/filters/AccountFilter.tsx
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from "@mui/material";
import { layoutStyles, commonStyles } from "../../styles";
import { SPACING } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

interface AccountFilterProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}

// ========================
// CONSTANTS
// ========================

const LABELS = {
  INPUT: "Accounts",
  PLACEHOLDER: "All Accounts",
} as const;

// ========================
// UTILITY FUNCTIONS
// ========================

const parseSelectValue = (value: string | string[]): string[] => {
  return typeof value === 'string' ? value.split(',') : value;
};

// ========================
// SUB-COMPONENTS
// ========================

interface RenderValueProps {
  selected: string[];
}

function RenderValue({ selected }: RenderValueProps) {
  if (selected.length === 0) {
    return <Box sx={{ color: 'text.secondary' }}>{LABELS.PLACEHOLDER}</Box>;
  }

  return (
    <Box sx={{ ...layoutStyles.flex.wrap, gap: SPACING.xs }}>
      {selected.map((value) => (
        <Chip
          key={value}
          label={value}
          size="small"
          sx={commonStyles.chip.default}
        />
      ))}
    </Box>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function AccountFilter({ value, options, onChange }: AccountFilterProps) {
  const handleChange = (newValue: string | string[]) => {
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
        renderValue={(selected) => <RenderValue selected={selected} />}
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
