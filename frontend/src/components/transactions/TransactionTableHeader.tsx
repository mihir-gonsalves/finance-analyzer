// frontend/src/components/transactions/TransactionTableHeader.tsx
import { useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { Add, FilterList, MoreVert, TableChart, ShowChart, Upload } from "@mui/icons-material";
import { FilterTags } from "./FilterTags";
import type { FilterState } from "../../types/filters";

type ViewMode = 'table' | 'chart';

interface TransactionTableHeaderProps {
  viewMode: ViewMode;
  filters: FilterState;
  filtersOpen: boolean;
  onToggleView: () => void;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
  onCSVUpload: () => void;
}

export function TransactionTableHeader({
  viewMode,
  filters,
  filtersOpen,
  onToggleView,
  onToggleFilters,
  onAddTransaction,
  onCSVUpload,
}: TransactionTableHeaderProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleCSVClick = () => {
    handleMenuClose();
    onCSVUpload();
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Button
        onClick={onToggleView}
        sx={{
          color: 'text.primary',
          textTransform: 'none',
          fontSize: '1.25rem',
          fontWeight: 600,
          p: 0,
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: 'transparent',
            color: 'primary.main',
          },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {viewMode === 'table' ? <TableChart /> : <ShowChart />}
        {viewMode === 'table' ? 'Ledger' : 'Chart'}
      </Button>
      
      <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
        <FilterTags filters={filters} />

        <Button
          variant={filtersOpen ? "contained" : "outlined"}
          startIcon={<FilterList />}
          onClick={onToggleFilters}
          sx={{ mr: 1 }}
        >
          Filters
        </Button>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddTransaction}
        >
          Add Transaction
        </Button>

        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <MoreVert />
        </IconButton>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleCSVClick}>
            <Upload sx={{ mr: 1 }} />
            Upload CSV
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
