// frontend/src/components/transactions/TransactionTableHeader.tsx
import { useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { Add, FilterList, MoreVert, TableChart, ShowChart, Upload } from "@mui/icons-material";
import { FilterTags } from "./FilterTags";
import type { TransactionFilters } from "../../types/filters";


type ViewMode = 'table' | 'chart';


interface TransactionTableHeaderProps {
  viewMode: ViewMode;
  filters: TransactionFilters;
  filtersOpen: boolean;
  onToggleView: () => void;
  onToggleFilters: () => void;
  onAddTransaction: () => void;
  onCSVUpload: () => void;
}


export function TransactionTableHeader({ viewMode, filters, filtersOpen, onToggleView, onToggleFilters, onAddTransaction, onCSVUpload, }: TransactionTableHeaderProps) {
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
        sx={(theme) => ({
          color: theme.palette.text.primary,
          fontSize: theme.typography.h6.fontSize,
          letterSpacing: theme.typography.h6.letterSpacing,
          p: 0,
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: 'transparent',
            color: theme.palette.primary.main,
          },          
          gap: theme.spacing(1),
        })}
      >
        {viewMode === 'table' ? <TableChart /> : <ShowChart />}
        {viewMode === 'table' ? 'Ledger' : 'Chart'}
      </Button>
      
      <Box display="flex" gap={1.5}> 
        <FilterTags filters={filters} />
        <Button
          variant={filtersOpen ? "contained" : "outlined"}
          startIcon={<FilterList />}
          onClick={onToggleFilters}
        >
          Filters
        </Button>

        <Button 
          variant="contained"
          startIcon={<Add />}
          onClick={onAddTransaction}
          sx={(theme) => ({
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          })}
        >
          Add Transaction
        </Button>

        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={(theme) => ({
            border: 1,
            borderColor: theme.palette.divider,
            borderRadius: 1,
          })}
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
          <MenuItem 
            onClick={handleCSVClick}
            sx={{
              gap: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Upload/>
            Upload CSV
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
