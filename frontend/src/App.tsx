import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";

import Dashboard from "./pages/Dashboard";
import Header from "./components/Header.tsx";
import { theme } from "./theme.ts";
import "./App.css";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Header />
          <Dashboard />
        </Box>
      </ThemeProvider>
    </QueryClientProvider>
  );
}