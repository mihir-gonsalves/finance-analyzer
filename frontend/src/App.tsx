// frontend/src/App.tsx - root component with QueryClientProvider, ThemeProvider, Header, and Dashboard
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material";
import Header from "./components/Header.tsx";
import Dashboard from "./pages/Dashboard";
import { theme } from "./styles/theme.ts";


const queryClient = new QueryClient();


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
          <Header />
          <Dashboard />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
