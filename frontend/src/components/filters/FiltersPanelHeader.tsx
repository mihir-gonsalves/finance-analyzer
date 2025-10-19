// frontend/src/components/filters/FiltersPanelHeader.tsx
import { Box, Typography, Chip, Button, IconButton } from "@mui/material";
import { FilterList, Clear } from "@mui/icons-material";


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
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Box display="flex" alignItems="center" gap={1}>
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

      <Box display="flex" alignItems="center" gap={1}>
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
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'primary.50',
            },
          }}
        >
          <Clear />
        </IconButton>
      </Box>
    </Box>
  );
}
