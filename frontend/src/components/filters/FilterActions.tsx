// frontend/src/components/filters/FilterActions.tsx
import { Box, Button } from "@mui/material";
import { layoutStyles } from "../../styles";

// ========================
// TYPE DEFINITIONS
// ========================

interface FilterActionsProps {
  hasUnsavedChanges: boolean;
  onReset: () => void;
  onApply: () => void;
}

// ========================
// CONSTANTS
// ========================

const BUTTON_CONFIG = {
  RESET: {
    LABEL: "Reset",
    VARIANT: "outlined" as const,
  },
  APPLY: {
    LABEL: "Apply Filters",
    VARIANT: "contained" as const,
  },
  SIZE: "small" as const,
} as const;

// ========================
// MAIN COMPONENT
// ========================

export function FilterActions({
  hasUnsavedChanges,
  onReset,
  onApply,
}: FilterActionsProps) {
  return (
    <Box sx={layoutStyles.filterPanel.actions}>
      <Button
        onClick={onReset}
        disabled={!hasUnsavedChanges}
        variant={BUTTON_CONFIG.RESET.VARIANT}
        size={BUTTON_CONFIG.SIZE}
      >
        {BUTTON_CONFIG.RESET.LABEL}
      </Button>

      <Button
        onClick={onApply}
        disabled={!hasUnsavedChanges}
        variant={BUTTON_CONFIG.APPLY.VARIANT}
        size={BUTTON_CONFIG.SIZE}
      >
        {BUTTON_CONFIG.APPLY.LABEL}
      </Button>
    </Box>
  );
}
