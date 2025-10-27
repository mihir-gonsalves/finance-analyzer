// frontend/src/components/filters/FiltersPanelHeader.tsx - filter panel title and collapse/expand controls
import { Box, Typography, Chip, Button, IconButton } from "@mui/material";
import { FilterList, Clear } from "@mui/icons-material";
import { layoutStyles, commonStyles } from "../../styles";


interface FiltersPanelHeaderProps {
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
}


export function FiltersPanelHeader({
  activeFilterCount,
  hasActiveFilters,
  onClearAll,
  onClose,
}: FiltersPanelHeaderProps) {
  return (
    <Box sx={layoutStyles.flex.rowBetween} mb={3}>
      <Box sx={{ ...layoutStyles.flex.row, gap: 1 }}>
        <FilterList sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="600">
          Filters
        </Typography>
        {activeFilterCount > 0 && (
          <Chip
            label={activeFilterCount}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Box sx={{ ...layoutStyles.flex.row, gap: 1 }}>
        {hasActiveFilters && (
          <Button
            onClick={onClearAll}
            size="small"
            startIcon={<Clear />}
            color="error"
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Clear All
          </Button>
        )}

        <IconButton
          onClick={onClose}
          size="small"
          sx={commonStyles.button.icon}
        >
          <Clear />
        </IconButton>
      </Box>
    </Box>
  );
}
