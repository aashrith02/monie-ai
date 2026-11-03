import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  categories: z.array(z.string()).min(1, "Select at least one category"),

  date: z.string().min(1, "Date is required"),

  notes: z.string().optional(),
});

function getCategoryLabel(category: string) {
  return category.replaceAll("_", " ");
}

type ExpenseFormData = z.infer<typeof expenseSchema>;

type Expense = {
  id: string;
  title: string;
  amount: number | string;
  categories: string[];
  date: string;
  notes?: string | null;
};

type ExpenseDialogProps = {
  mode?: "add" | "view" | "edit";
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
};

export default function ExpenseDialog({
  mode = "add",
  open,
  expense,
  onClose,
  onEdit,
  onSave,
}: ExpenseDialogProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      categories: [],
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const abortController = new AbortController();
    setCategoriesLoading(true);
    setCategoriesError("");

    fetch("http://localhost:5001/api/expenses/categories", {
      signal: abortController.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load expense categories");
        }

        const data: { categories: unknown } = await response.json();
        if (
          !Array.isArray(data.categories) ||
          !data.categories.every((category) => typeof category === "string")
        ) {
          throw new Error("Invalid expense categories response");
        }

        setCategories(data.categories);
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }
        console.error("Error loading expense categories:", error);
        setCategoriesError(
          "Unable to load categories. Close and reopen this dialog to retry.",
        );
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setCategoriesLoading(false);
        }
      });

    return () => abortController.abort();
  }, [open]);

  /*
   * When the dialog opens with an expense,
   * populate the form with that expense.
   *
   * When adding a new expense, reset to empty values.
   */
  useEffect(() => {
    if (open && expense && (mode === "view" || mode === "edit")) {
      reset({
        title: expense.title,
        amount: Number(expense.amount),
        categories: expense.categories,
        date: expense.date.split("T")[0],
        notes: expense.notes ?? "",
      });
    }

    if (open && mode === "add") {
      reset({
        title: "",
        amount: undefined,
        categories: [],
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  }, [open, mode, expense, reset]);

  async function onSubmit(data: ExpenseFormData) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not authenticated");
      }

      /*
       * ADD
       */
      if (mode === "add") {
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
      }

      /*
       * EDIT
       */
      if (mode === "edit" && expense) {
        const response = await fetch(
          `http://localhost:5001/api/expenses/updateExpense/${expense.id}`,
          {
            method: "PUT",

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
            result.message || "Failed to update expense"
          );
        }

        console.log("Expense updated:", result);
      }
      await onSave();
      reset();
 // Call the onSave callback to refresh expenses in the parent component

      onClose();
    } catch (error) {
      console.error("Expense operation failed:", error);
    }
  }

  function handleDialogClose() {
    reset();
    onClose();
  }

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isAdd && "Add Expense"}
        {isView && "Expense Details"}
        {isEdit && "Edit Expense"}
      </DialogTitle>

      <DialogContent>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ pt: 1 }}
        >
          <Stack spacing={3}>

            {/* Title */}
            <TextField
              label="Title"
              placeholder="e.g. Lunch"
              fullWidth
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
              slotProps={{
                input: {
                  readOnly: isView,
                },
              }}
            />

            {/* Amount */}
            <TextField
              label="Amount"
              type="number"
              fullWidth
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
                input: {
                  readOnly: isView,
                },
              }}
              {...register("amount", {
                valueAsNumber: true,
              })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
            />

            {/* Categories */}
            <FormControl
              fullWidth
              error={!!errors.categories || !!categoriesError}
            >
              <InputLabel id="expense-categories-label">Categories</InputLabel>
              <Controller
                name="categories"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="expense-categories-label"
                    label="Categories"
                    multiple
                    disabled={isView || categoriesLoading || !!categoriesError}
                    renderValue={(selected) =>
                      selected.map(getCategoryLabel).join(", ")
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        <Checkbox checked={field.value.includes(category)} />
                        <ListItemText primary={getCategoryLabel(category)} />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText>
                {categoriesError ||
                  (categoriesLoading
                    ? "Loading categories..."
                    : errors.categories?.message)}
              </FormHelperText>
            </FormControl>

            {/* Date */}
            <TextField
              label="Date"
              type="date"
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                input: {
                  readOnly: isView,
                },
              }}
              {...register("date")}
              error={!!errors.date}
              helperText={errors.date?.message}
            />

            {/* Notes */}
            <TextField
              label="Notes"
              placeholder="Optional"
              multiline
              rows={3}
              fullWidth
              {...register("notes")}
              error={!!errors.notes}
              helperText={errors.notes?.message}
              slotProps={{
                input: {
                  readOnly: isView,
                },
              }}
            />

            {/* Buttons */}
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
                Close
              </Button>

              {/* View mode */}
              {isView && (
                <Button
                  type="button"
                  variant="contained"
                  onClick={onEdit}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Edit
                </Button>
              )}

              {/* Add mode */}
              {isAdd && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={categoriesLoading || !!categoriesError}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Add Expense
                </Button>
              )}

              {/* Edit mode */}
              {isEdit && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={categoriesLoading || !!categoriesError}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Save Changes
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
