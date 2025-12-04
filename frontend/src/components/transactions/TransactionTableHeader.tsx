// frontend/src/components/transactions/TransactionTableHeader.tsx
import { useState } from "react";
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  TableChart,
  Timeline,
  EqualizerRounded,
  FilterList,
  Add,
  MoreVert,
  Upload,
  FileDownload,
} from "@mui/icons-material";
import { FilterTags } from "./FilterTags";
import type { TransactionFilters } from "../../types/filters";
import { commonStyles, layoutStyles, conditionalStyle } from "../../styles";
import { SPACING } from "../../styles/constants";

// ========================
// TYPE DEFINITIONS
// ========================

type ViewMode = 'table' | 'timeline' | 'barchart';

interface TransactionTableHeaderProps {
  viewMode: ViewMode;
  filters: TransactionFilters;
  filtersOpen: boolean;
  onToggleView: () => void;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
  onCSVUpload: () => void;
  onExportCSV: () => void;
}

// ========================
// VIEW MODE CONFIGURATION
// ========================

const VIEW_MODE_CONFIG: Record<ViewMode, { icon: typeof TableChart; tooltip: string }> = {
  table: {
    icon: TableChart,
    tooltip: 'Switch to Timeline',
  },
  timeline: {
    icon: Timeline,
    tooltip: 'Switch to Bar Chart',
  },
  barchart: {
    icon: EqualizerRounded,
    tooltip: 'Switch to Table',
  },
};

// ========================
// SUB-COMPONENTS
// ========================

interface ViewToggleButtonProps {
  viewMode: ViewMode;
  onToggleView: () => void;
}

function ViewToggleButton({ viewMode, onToggleView }: ViewToggleButtonProps) {
  const config = VIEW_MODE_CONFIG[viewMode];
  const Icon = config.icon;

  return (
    <Tooltip title={config.tooltip}>
      <IconButton onClick={onToggleView} color="primary" sx={commonStyles.button.icon}>
        <Icon />
      </IconButton>
    </Tooltip>
  );
}

interface ActionButtonsProps {
  filtersOpen: boolean;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
}

function ActionButtons({
  filtersOpen,
  onToggleFilters,
  onAddTransaction,
  onMenuOpen,
}: ActionButtonsProps) {
  return (
    <>
      <Tooltip title={filtersOpen ? 'Hide Filters' : 'Show Filters'}>
        <IconButton
          onClick={onToggleFilters}
          sx={conditionalStyle(
            filtersOpen,
            commonStyles.button.iconActive,
            commonStyles.button.icon
          )}
        >
          <FilterList sx={{ color: 'primary.main' }} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add Transaction">
        <IconButton onClick={onAddTransaction} color="primary" sx={commonStyles.button.icon}>
          <Add />
        </IconButton>
      </Tooltip>

      <Tooltip title="More Options">
        <IconButton onClick={onMenuOpen} color="primary" sx={commonStyles.button.icon}>
          <MoreVert />
        </IconButton>
      </Tooltip>
    </>
  );
}

interface OptionsMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onCSVUpload: () => void;
  onExportCSV: () => void;
}

function OptionsMenu({
  anchorEl,
  open,
  onClose,
  onCSVUpload,
  onExportCSV,
}: OptionsMenuProps) {
  const handleCSVUpload = () => {
    onClose();
    onCSVUpload();
  };

  const handleExportCSV = () => {
    onClose();
    onExportCSV();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem onClick={handleCSVUpload}>
        <ListItemIcon>
          <Upload fontSize="small" />
        </ListItemIcon>
        <ListItemText>Upload CSV</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleExportCSV}>
        <ListItemIcon>
          <FileDownload fontSize="small" />
        </ListItemIcon>
        <ListItemText>Export to CSV</ListItemText>
      </MenuItem>
    </Menu>
  );
}

// ========================
// MAIN COMPONENT
// ========================

export function TransactionTableHeader({
  viewMode,
  filters,
  filtersOpen,
  onToggleView,
  onToggleFilters,
  onAddTransaction,
  onCSVUpload,
  onExportCSV,
}: TransactionTableHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box mb={SPACING.md}>
      <Box sx={layoutStyles.flex.rowBetween}>
        {/* View Toggle */}
        <ViewToggleButton viewMode={viewMode} onToggleView={onToggleView} />

        {/* Right Side Actions */}
        <Box sx={{ ...layoutStyles.flex.row, gap: SPACING.md }}>
          <FilterTags filters={filters} />
          
          <ActionButtons
            filtersOpen={filtersOpen}
            onToggleFilters={onToggleFilters}
            onAddTransaction={onAddTransaction}
            onMenuOpen={handleMenuOpen}
          />
        </Box>
      </Box>

      {/* Options Menu */}
      <OptionsMenu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onCSVUpload={onCSVUpload}
        onExportCSV={onExportCSV}
      />
    </Box>
  );
}
