// frontend/src/components/transactions/TransactionTableHeader.tsx - active filter tags and action buttons (add, upload, export)
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { TableChart, Timeline, EqualizerRounded, FilterList, Add, MoreVert, Upload, FileDownload } from "@mui/icons-material";
import { FilterTags } from "./FilterTags";
import type { TransactionFilters } from "../../types/filters";
import { useState } from "react";
import { commonStyles, layoutStyles, conditionalStyle } from "../../styles";


interface TransactionTableHeaderProps {
  viewMode: 'table' | 'timeline' | 'barchart';
  filters: TransactionFilters;
  filtersOpen: boolean;
  onToggleView: () => void;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
  onCSVUpload: () => void;
  onExportCSV: () => void;
}


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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCSVUpload = () => {
    handleMenuClose();
    onCSVUpload();
  };

  const handleExportCSV = () => {
    handleMenuClose();
    onExportCSV();
  };

  const getViewIcon = () => {
    switch (viewMode) {
      case 'table':
        return <TableChart />;
      case 'timeline':
        return <Timeline />;
      case 'barchart':
        return <EqualizerRounded />;
    }
  };

  const getViewTooltip = () => {
    switch (viewMode) {
      case 'table':
        return 'Switch to Timeline';
      case 'timeline':
        return 'Switch to Bar Chart';
      case 'barchart':
        return 'Switch to Table';
    }
  };

  return (
    <Box mb={2}>
      <Box sx={layoutStyles.flex.rowBetween}>
        <Tooltip title={getViewTooltip()}>
          <IconButton onClick={onToggleView} color="primary" sx={commonStyles.button.icon}>
            {getViewIcon()}
          </IconButton>
        </Tooltip>

        <Box sx={{ ...layoutStyles.flex.row, gap: 2 }}>
          <FilterTags filters={filters} />

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
            <IconButton onClick={handleMenuClick} color="primary" sx={commonStyles.button.icon}>
              <MoreVert />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
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
        </Box>
      </Box>
    </Box>
  );
}
