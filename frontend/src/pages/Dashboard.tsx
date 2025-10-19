// frontend/src/pages/Dashboard.tsx
import { useState } from "react";
import { Container, Grid, Box, Fade, Collapse } from "@mui/material";
import { TransactionProvider } from "../context/TransactionContext";
import TransactionTable from "../components/TransactionTable";
import AnalyticsPanel from "../components/AnalyticsPanel";
import FiltersPanel from "../components/FiltersPanel";
import type { TransactionFilters } from "../types/filters";

export default function Dashboard() {
  const [filters, setFilters] = useState<TransactionFilters>({
    dateFrom: '',
    dateTo: '',
    categories: [],
    accounts: [],
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <TransactionProvider filters={filters}>
      <Container
        maxWidth="xl"
        sx={{
          mt: { xs: 2, md: 3 },
          mb: 2.5,
          px: { xs: 2, sm: 3 }
        }}
      >
        <Fade in timeout={600}>
          <Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Filters Panel with smooth transition */}
              <Grid size={{ xs: 12 }}>
                <Collapse in={filtersOpen} timeout={300} unmountOnExit>
                  <FiltersPanel
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                      setFilters(newFilters);
                      setFiltersOpen(false);
                    }}
                    onClose={() => setFiltersOpen(false)}
                  />
                </Collapse>
              </Grid>

              {/* Left side - Transaction Table */}
              <Grid size={{ xs: 12, lg: 8 }}>
                <TransactionTable
                  filters={filters}
                  filtersOpen={filtersOpen}
                  onToggleFilters={() => setFiltersOpen(!filtersOpen)}
                />
              </Grid>

              {/* Right side - Analytics */}
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