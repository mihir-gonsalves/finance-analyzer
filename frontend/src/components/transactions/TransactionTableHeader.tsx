// frontend/src/components/transactions/TransactionTableHeader.tsx - active filter tags and action buttons (add, upload, export)
import { Box, IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { TableChart, ShowChart, FilterList, Add, MoreVert, Upload, FileDownload } from "@mui/icons-material";
import { FilterTags } from "./FilterTags";
import type { TransactionFilters } from "../../types/filters";
import { useState } from "react";


interface TransactionTableHeaderProps {
  viewMode: 'table' | 'chart';
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

  return (
    <Box mb={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" >
          <Tooltip title={viewMode === 'table' ? 'Switch to Chart' : 'Switch to Table'}>
            <IconButton onClick={onToggleView} color="primary">
              {viewMode === 'table' ? <TableChart /> : <ShowChart />}
            </IconButton>
          </Tooltip>

        <Box display="flex" gap={2}>
          <FilterTags filters={filters} />

          <Tooltip title={filtersOpen ? 'Hide Filters' : 'Show Filters'}>
            <IconButton onClick={onToggleFilters} color={filtersOpen ? 'primary' : 'default'}>
              <FilterList />
            </IconButton>
          </Tooltip>

          <Tooltip title="Add Transaction">
            <IconButton onClick={onAddTransaction} color="primary">
              <Add />
            </IconButton>
          </Tooltip>

          <Tooltip title="More Options">
            <IconButton onClick={handleMenuClick} color="primary">
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
