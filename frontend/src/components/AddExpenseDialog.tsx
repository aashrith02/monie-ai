import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  category: z.string().min(1, "Category is required"),

  date: z.string().min(1, "Date is required"),

  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

type AddExpenseDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddExpenseDialog({
  open,
  onClose,
}: AddExpenseDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  async function onSubmit(data: ExpenseFormData) {
     try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("You are not authenticated");
    }

    const response = await fetch(
      "http://localhost:5001/api/expenses/addExpenses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to create expense"
      );
    }

    console.log("Expense created:", result);

    reset();
    onClose();
  } catch (error) {
    console.error("Expense creation failed:", error);
  }
  }

  function handleDialogClose() {
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Add Expense</DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ pt: 1 }}
        >
          <Stack spacing={3}>
            <TextField
              label="Title"
              placeholder="e.g. Lunch"
              fullWidth
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="Amount"
              type="number"
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
              {...register("amount", {
                valueAsNumber: true,
              })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />

            <TextField
              select
              label="Category"
              fullWidth
              defaultValue=""
              {...register("category")}
              error={!!errors.category}
              helperText={errors.category?.message}
            >
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Transport">Transport</MenuItem>
              <MenuItem value="Shopping">Shopping</MenuItem>
              <MenuItem value="Entertainment">
                Entertainment
              </MenuItem>
              <MenuItem value="Bills">Bills</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="Date"
              type="date"
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
            />

            <TextField
              label="Notes"
              placeholder="Optional"
              multiline
              rows={3}
              fullWidth
              {...register("notes")}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />

            <Stack
              direction="row"
              justifyContent="flex-end"
              spacing={2}
            >
              <Button
                type="button"
                onClick={handleDialogClose}
                sx={{
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                Add Expense
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}