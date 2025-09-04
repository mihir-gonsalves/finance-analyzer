import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import client from "../api/client";


interface NewTransactionDialogProps {
  open: boolean;
  onClose: () => void;
}


export default function NewTransactionDialog({ open, onClose }: NewTransactionDialogProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [account, setAccount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async () => {
      await client.post("/transactions", {
        description,
        amount: Number(amount),
        account,
        category,
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setDescription("");
    setAmount("");
    setAccount("");
    setCategory("");
    setDate("");
    onClose();
  };

  const handleSubmit = () => {
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>New Transaction</DialogTitle>
      <DialogContent>
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            fullWidth
            margin="dense"
        />
        <TextField
          label="Account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
