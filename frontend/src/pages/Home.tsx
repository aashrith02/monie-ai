import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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

function formatCalendarDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getChartDateRange() {
  const now = new Date();
  const to = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 48);
  return { from: formatCalendarDate(from), to: formatCalendarDate(to) };
}

async function loadExpensesBetween(from: string, to: string): Promise<Expense[]> {
  try {
    const token = localStorage.getItem("token") || "";
    const query = new URLSearchParams({ from, to });
    const response = await fetch(
      `http://localhost:5001/api/expenses/getExpenses?${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to load chart expenses");
    }

    const data: { expenses: Expense[] } = await response.json();
    return data.expenses;
  } catch (error) {
    console.error("Error loading chart expenses:", error);
    return [];
  }
}

export default function Home() {
  const [chartPeriod, setChartPeriod] = useState<"days" | "weeks">("days");
  const [chartExpenses, setChartExpenses] = useState<Expense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const [expenseDialogMode, setExpenseDialogMode] =
    useState<"add" | "view" | "edit">("add");

  const [selectedExpense, setSelectedExpense] =
    useState<Expense | null>(null);

  const [recentExpenses, setRecentExpenses] =
    useState<Expense[]>([]);

  const refreshChartExpenses = async () => {
    const { from, to } = getChartDateRange();
    setChartExpenses(await loadExpensesBetween(from, to));
  };

  const refreshExpenses = async (month = selectedMonth) => {
    const token = localStorage.getItem("token") || "";

    const [expenses] = await Promise.all([
      loadExpensesForMonth(token, month),
      refreshChartExpenses(),
    ]);

    setRecentExpenses(expenses);
  };

  const loadExpensesForMonth = async (
    token: string,
    month: string,
  ): Promise<Expense[]> => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/expenses/getExpenses?month=${encodeURIComponent(month)}`,
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
    let isCurrent = true;

    loadExpensesForMonth(token, selectedMonth).then((expenses) => {
      if (isCurrent) {
        setRecentExpenses(expenses);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedMonth]);

  useEffect(() => {
    let isCurrent = true;
    const { from, to } = getChartDateRange();

    loadExpensesBetween(from, to).then((expenses) => {
      if (isCurrent) {
        setChartExpenses(expenses);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  const chartEnd = new Date();
  chartEnd.setUTCHours(0, 0, 0, 0);
  const chartStart = new Date(chartEnd);
  chartStart.setUTCDate(
    chartStart.getUTCDate() - (chartPeriod === "days" ? 6 : 48),
  );
  const bucketDays = chartPeriod === "days" ? 1 : 7;
  const chartBuckets = Array.from({ length: 7 }, (_, index) => {
    const start = new Date(chartStart);
    start.setUTCDate(start.getUTCDate() + index * bucketDays);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + bucketDays - 1);

    const labelFormat: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    };
    const startLabel = start.toLocaleDateString(undefined, labelFormat);
    const endLabel = end.toLocaleDateString(undefined, labelFormat);

    return {
      label: chartPeriod === "days" ? startLabel : `${startLabel}–${endLabel}`,
      title: chartPeriod === "days" ? startLabel : `${startLabel} to ${endLabel}`,
      total: 0,
    };
  });

  chartExpenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    if (Number.isNaN(expenseDate.getTime())) {
      return;
    }

    const expenseDay = Date.UTC(
      expenseDate.getUTCFullYear(),
      expenseDate.getUTCMonth(),
      expenseDate.getUTCDate(),
    );
    const startDay = Date.UTC(
      chartStart.getUTCFullYear(),
      chartStart.getUTCMonth(),
      chartStart.getUTCDate(),
    );
    const dayOffset = Math.floor((expenseDay - startDay) / 86_400_000);
    const bucketIndex = Math.floor(dayOffset / bucketDays);

    if (bucketIndex >= 0 && bucketIndex < chartBuckets.length) {
      chartBuckets[bucketIndex].total += Number(expense.amount) || 0;
    }
  });

  const totalSpending = chartBuckets.reduce((total, bucket) => total + bucket.total, 0);
  const maxBucketSpending = Math.max(
    ...chartBuckets.map((bucket) => bucket.total),
    1,
  );
  const spendingCurrency = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

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
        <TextField
          type="month"
          size="small"
          label="Month"
          value={selectedMonth}
          onChange={(event) => {
            if (event.target.value) {
              setSelectedMonth(event.target.value);
            }
          }}
          slotProps={{
            htmlInput: {
              "aria-label": "Filter expenses by month",
            },
          }}
        />
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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Spending trend
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {chartPeriod === "days" ? "Last 7 days" : "Last 7 weeks"}
              </Typography>
            </Box>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={chartPeriod}
              onChange={(_, value: "days" | "weeks" | null) => {
                if (value) {
                  setChartPeriod(value);
                }
              }}
              aria-label="Spending chart period"
            >
              <ToggleButton value="days" aria-label="Show last 7 days">
                7 days
              </ToggleButton>
              <ToggleButton value="weeks" aria-label="Show last 7 weeks">
                7 weeks
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box
            sx={{
              height: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 2,
              px: { xs: 0, sm: 2 },
              borderRadius: 2,
              backgroundColor: "action.hover",
            }}
          >
            {totalSpending === 0 ? (
              <Typography color="text.secondary">
                No expenses in this period
              </Typography>
            ) : (
              <Box sx={{ width: "100%" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, ml: { xs: 0.5, sm: 2 } }}
                >
                  Total: {spendingCurrency.format(totalSpending)}
                </Typography>
                <Box
                  component="svg"
                  viewBox="0 0 1000 220"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`Spending for the last 7 ${chartPeriod}`}
                  sx={{ display: "block", width: "100%", height: 220 }}
                >
                  <title>
                    Spending for the last 7 {chartPeriod}, grouped by{" "}
                    {chartPeriod === "days" ? "day" : "week"}
                  </title>
                  {[0, 1, 2, 3, 4].map((step) => {
                    const y = 180 - step * 40;
                    const value = (maxBucketSpending * step) / 4;

                    return (
                      <g key={step}>
                        <line
                          x1="58"
                          y1={y}
                          x2="1000"
                          y2={y}
                          stroke="currentColor"
                          opacity="0.12"
                        />
                        <text
                          x="50"
                          y={y + 4}
                          textAnchor="end"
                          fontSize="12"
                          fill="currentColor"
                          opacity="0.65"
                        >
                          {spendingCurrency.format(value)}
                        </text>
                      </g>
                    );
                  })}
                  {chartBuckets.map((bucket, index) => {
                    const columnWidth = 942 / chartBuckets.length;
                    const barWidth = columnWidth * 0.58;
                    const barHeight = (bucket.total / maxBucketSpending) * 160;
                    const x = 58 + index * columnWidth + (columnWidth - barWidth) / 2;

                    return (
                      <g key={bucket.label}>
                        <rect
                          x={x}
                          y={180 - barHeight}
                          width={barWidth}
                          height={barHeight}
                          rx="3"
                          fill="var(--mui-palette-primary-main)"
                        >
                          <title>
                            {`${bucket.title}: ${spendingCurrency.format(bucket.total)}`}
                          </title>
                        </rect>
                        <text
                          x={x + barWidth / 2}
                          y="205"
                          textAnchor="middle"
                          fontSize="12"
                          fill="currentColor"
                          opacity="0.65"
                        >
                          {bucket.label}
                        </text>
                      </g>
                    );
                  })}
                </Box>
              </Box>
            )}
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
