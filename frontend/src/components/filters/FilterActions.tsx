// frontend/src/components/filters/FilterActions.tsx - apply/clear filter buttons
import { Box, Button } from "@mui/material";
import { layoutStyles } from "../../styles";


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
    <Box sx={layoutStyles.filterPanel.actions}>
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
