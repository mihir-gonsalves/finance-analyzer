// frontend/src/utils/selectUtils.tsx
import { Box, Chip } from "@mui/material";
import { layoutStyles, commonStyles } from "../styles";
import { SPACING } from "../styles/constants";

export function parseMultiSelectValue<T>(value: string | T[]): T[] {
  if (typeof value === 'string') {
    return Array.isArray(value) ? value : [value as unknown as T];
  }
  return value;
}

interface MultiSelectChipsProps {
  selected: (string | number)[];
  getLabel: (value: string | number) => string;
  placeholder?: string;
}

export function MultiSelectChips({ selected, getLabel, placeholder = "All" }: MultiSelectChipsProps) {
  if (selected.length === 0) {
    return <Box sx={{ color: 'text.secondary' }}>{placeholder}</Box>;
  }

  return (
    <Box sx={{ ...layoutStyles.flex.wrap, gap: SPACING.xs }}>
      {selected.map((value) => (
        <Chip
          key={value}
          label={getLabel(value)}
          size="small"
          sx={commonStyles.chip.default}
        />
      ))}
    </Box>
  );
}
