// frontend/src/components/filters/FilterActions.tsx - apply/Clear filter buttons
import { Box, Button } from "@mui/material";


interface FilterActionsProps {
  hasUnsavedChanges: boolean;
  onReset: () => void;
  onApply: () => void;
}


export function FilterActions({
  hasUnsavedChanges,
  onReset,
  onApply,
}: FilterActionsProps) {
  return (
    <Box display="flex" gap={2} justifyContent="flex-end">
      <Button
        onClick={onReset}
        disabled={!hasUnsavedChanges}
        variant="outlined"
        size="small"
      >
        Reset
      </Button>
      <Button
        onClick={onApply}
        disabled={!hasUnsavedChanges}
        variant="contained"
        size="small"
      >
        Apply Filters
      </Button>
    </Box>
  );
}
