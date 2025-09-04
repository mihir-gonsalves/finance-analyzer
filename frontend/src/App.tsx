import { useState } from "react";
import { Button, Container } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import TransactionTable from "./components/TransactionTable";
import NewTransactionDialog from "./components/NewTransactionDialog";


const queryClient = new QueryClient();


export default function App() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Container maxWidth="md" style={{ marginTop: "2rem" }}>
        <h1 style={{ textAlign: "center" }}>Transactions</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          style={{ marginBottom: "1rem" }}
        >
          New Transaction
        </Button>
        <TransactionTable />
        <NewTransactionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      </Container>
    </QueryClientProvider>
  );
}
