import { Container, Grid } from "@mui/material";

import TransactionTable from "../components/TransactionTable";
import AnalyticsPanel from "../components/AnalyticsPanel";

export default function Dashboard() {
  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left side - Transaction Table (2/3 width) */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <TransactionTable />
        </Grid>

        {/* Right side - Analytics (1/3 width) */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <AnalyticsPanel />
        </Grid>
      </Grid>
    </Container>
  );
}