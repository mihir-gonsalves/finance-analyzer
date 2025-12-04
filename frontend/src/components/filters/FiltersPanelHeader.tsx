// frontend/src/components/filters/FiltersPanelHeader.tsx
import { Box, Typography, Chip, Button, IconButton } from "@mui/material";
import { FilterList, Clear } from "@mui/icons-material";
import { layoutStyles, commonStyles } from "../../styles";
import { SPACING } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

interface FiltersPanelHeaderProps {
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
}

// ========================
// CONSTANTS
// ========================

const TEXT = {
  TITLE: "Filters",
  CLEAR_ALL: "Clear All",
} as const;

const BUTTON_CONFIG = {
  SIZE: "small" as const,
  CLEAR_ALL_MARGIN: 1,
} as const;

// ========================
// SUB-COMPONENTS
// ========================

interface TitleSectionProps {
  activeFilterCount: number;
}

function TitleSection({ activeFilterCount }: TitleSectionProps) {
  return (
    <Box sx={{ ...layoutStyles.flex.row, gap: SPACING.sm }}>
      <FilterList sx={{ color: 'primary.main' }} />
      <Typography variant="h6" fontWeight="600">
        {TEXT.TITLE}
      </Typography>
      {activeFilterCount > 0 && (
        <Chip
          label={activeFilterCount}
          size="small"
          color="primary"
          sx={{ ml: SPACING.sm }}
        />
      )}
    </Box>
  );
}

interface ActionsSectionProps {
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
}

function ActionsSection({ hasActiveFilters, onClearAll, onClose }: ActionsSectionProps) {
  return (
    <Box sx={{ ...layoutStyles.flex.row, gap: SPACING.sm }}>
      {hasActiveFilters && (
        <Button
          onClick={onClearAll}
          size={BUTTON_CONFIG.SIZE}
          startIcon={<Clear />}
          color="error"
          variant="outlined"
          sx={{ mr: BUTTON_CONFIG.CLEAR_ALL_MARGIN }}
        >
          {TEXT.CLEAR_ALL}
        </Button>
      )}

      <IconButton
        onClick={onClose}
        size={BUTTON_CONFIG.SIZE}
        sx={commonStyles.button.icon}
      >
        <Clear />
      </IconButton>
    </Box>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function FiltersPanelHeader({
  activeFilterCount,
  hasActiveFilters,
  onClearAll,
  onClose,
}: FiltersPanelHeaderProps) {
  return (
    <Box sx={layoutStyles.flex.rowBetween} mb={SPACING.lg}>
      <TitleSection activeFilterCount={activeFilterCount} />
      <ActionsSection
        hasActiveFilters={hasActiveFilters}
        onClearAll={onClearAll}
        onClose={onClose}
      />
    </Box>
  );
}
