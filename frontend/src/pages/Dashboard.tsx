// pages/Dashboard.tsx
import { Container, Grid, Box, Fade } from "@mui/material";

import TransactionTable from "../components/TransactionTable";
import AnalyticsPanel from "../components/AnalyticsPanel";

export default function Dashboard() {
  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: { xs: 2, md: 3 }, 
        mb: 4,
        px: { xs: 2, sm: 3 }
      }}
    >
      <Fade in timeout={600}>
        <Box>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Left side - Transaction Table (responsive width) */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <TransactionTable />
            </Grid>

            {/* Right side - Analytics (responsive width) */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <AnalyticsPanel />
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
}