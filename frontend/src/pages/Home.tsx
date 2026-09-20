import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import ExpenseDialog from "../components/ExpenseDialog";
import { useEffect, useState } from "react";

type Expense = {
  id: string;
  title: string;
  amount: number | string;
  category: string;
  date: string;
  notes?: string | null;
};

export default function Home() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const [expenseDialogMode, setExpenseDialogMode] =
    useState<"add" | "view" | "edit">("add");

  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);

  const [recentExpenses, setRecentExpenses] =
    useState<Expense[]>([]);

  const refreshExpenses = async () => {
    const token = localStorage.getItem("token") || "";

    const expenses = await loadRecentlyAddedExpenses(token);

    setRecentExpenses(expenses);
};

  const loadRecentlyAddedExpenses = async (
    token: string,
  ): Promise<Expense[]> => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/expenses/getExpenses?numberOfExpenses=5",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load expenses");
      }

      const data: { expenses: Expense[] } = await response.json();

      console.log("Expenses:", data.expenses);

      return data.expenses;
    } catch (error) {
      console.error("Error loading expenses:", error);
      return [];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    loadRecentlyAddedExpenses(token).then((expenses) => {
      setRecentExpenses(expenses);
    });
  }, []);

  function handleAddExpense() {
    setSelectedExpense(null);
    setExpenseDialogMode("add");
    setExpenseDialogOpen(true);
  }

  function handleViewExpense(expense: Expense) {
    setSelectedExpense(expense);
    setExpenseDialogMode("view");
    setExpenseDialogOpen(true);
  }

  function handleCloseDialog() {
    setExpenseDialogOpen(false);
    setSelectedExpense(null);
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Button
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          August 2026 ▾
        </Button>
      </Stack>

      {/* Recent Activity */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{
              mb: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={600}
                borderRight="1px solid"
                borderColor="divider"
                pr={2}
              >
                Activity
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ ml: "auto" }}>
              {/* Add Expense */}
              <Button
                variant="outlined"
                startIcon={<AddOutlinedIcon />}
                onClick={handleAddExpense}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Add Expense
              </Button>

              {/* Add Income */}
              <Button
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Add Income
              </Button>
            </Stack>
          </Stack>

          <Divider />

          {/* Recent Expenses */}
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {recentExpenses.length === 0 ? (
              <Typography
                color="text.secondary"
                sx={{
                  py: 3,
                  textAlign: "center",
                }}
              >
                No recent expenses
              </Typography>
            ) : (
              recentExpenses.map((expense) => (
                <ActivityRow
                  key={expense.id}
                  title={expense.title}
                  category={expense.category}
                  amount={`- ₹${Number(expense.amount).toFixed(2)}`}
                  date={expense.date}
                  onClick={() => handleViewExpense(expense)}
                />
              ))
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Spending this month */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Spending this month
          </Typography>

          <Typography variant="body2" color="text.secondary">
            August 2026
          </Typography>

          <Box
            sx={{
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
              borderRadius: 2,
              backgroundColor: "action.hover",
            }}
          >
            <Typography color="text.secondary">
              for
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          mb: 4,
        }}
      >
        {/* Income */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">
                  Income
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  ₹50,000
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  This month
                </Typography>
              </Box>

              <TrendingUpOutlinedIcon />
            </Stack>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">
                  Expenses
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  ₹32,450
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  This month
                </Typography>
              </Box>

              <TrendingDownOutlinedIcon />
            </Stack>
          </CardContent>
        </Card>

        {/* Net Balance */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">
                  Net Balance
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  ₹17,550
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  This month
                </Typography>
              </Box>

              <AccountBalanceWalletOutlinedIcon />
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Expense Dialog */}
      <ExpenseDialog
        open={expenseDialogOpen}
        mode={expenseDialogMode}
        expense={selectedExpense}
        onClose={handleCloseDialog}
        onSave ={refreshExpenses}
        onEdit={() => {
        setExpenseDialogMode("edit");

        }}
      />
    </Box>
  );
}

type ActivityRowProps = {
  title: string;
  category: string;
  amount: string;
  date: string;
  onClick: () => void;
};

function ActivityRow({
  title,
  category,
  amount,
  date,
  onClick,
}: ActivityRowProps) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        cursor: "pointer",
        transition: "background-color 0.2s",

        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <CardContent
        sx={{
          py: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography fontWeight={600}>
              {title}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {category}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                •
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {new Date(date).toLocaleDateString()}
              </Typography>
            </Stack>
          </Box>

          <Typography
            fontWeight={600}
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            {amount}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

