// frontend/src/pages/Dashboard.tsx
import { useState } from "react";
import { Container, Grid, Box, Fade, Collapse } from "@mui/material";
import { TransactionProvider } from "../context/TransactionContext";
import TransactionTable from "../components/TransactionTable";
import AnalyticsPanel from "../components/AnalyticsPanel";
import FiltersPanel from "../components/FiltersPanel";
import { layoutStyles } from "../styles";
import { TRANSITIONS } from "../styles/constants";
import type { TransactionFilters } from "../types/filters";

const INITIAL_FILTERS: TransactionFilters = {
  dateFrom: '',
  dateTo: '',
  spend_category_ids: [],
  cost_center_ids: [],
  accounts: [],
  minAmount: '',
  maxAmount: '',
  searchTerm: '',
};

export default function Dashboard() {
  const [filters, setFilters] = useState<TransactionFilters>(INITIAL_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setFiltersOpen(false);
  };

  const handleToggleFilters = () => {
    setFiltersOpen(prev => !prev);
  };

  return (
    <TransactionProvider filters={filters}>
      <Container maxWidth="xl" sx={layoutStyles.dashboard.container}>
        <Fade in timeout={TRANSITIONS.pageLoad}>
          <Box>
            <Grid container spacing={layoutStyles.spacing.sectionGap}>
              {/* Filters Panel */}
              <Grid size={{ xs: 12 }}>
                <Collapse in={filtersOpen} timeout={TRANSITIONS.normal} unmountOnExit>
                  <FiltersPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClose={() => setFiltersOpen(false)}
                  />
                </Collapse>
              </Grid>

              {/* Transaction Table */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <TransactionTable
                  filters={filters}
                  filtersOpen={filtersOpen}
                  onToggleFilters={handleToggleFilters}
                />
              </Grid>

              {/* Analytics Panel */}
              <Grid size={{ xs: 12, lg: 4 }}>
                <AnalyticsPanel />
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </TransactionProvider>
  );
}
