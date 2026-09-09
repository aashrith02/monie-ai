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
import AddExpenseDialog from "../components/AddExpenseDialog";
import { useState } from "react";
export default function Home() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
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

            {/* Recent activity */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
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
              <Button
                variant="outlined"
                startIcon={<AddOutlinedIcon />}
                onClick={() => setExpenseDialogOpen(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Add Expense
              </Button>
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

          <ActivityRow
            title="Lunch"
            category="Food"
            amount="- ₹350"
          />

          <ActivityRow
            title="Salary"
            category="Income"
            amount="+ ₹50,000"
          />

          <ActivityRow
            title="Uber"
            category="Transport"
            amount="- ₹420"
          />

          <ActivityRow
            title="PlayStation"
            category="Entertainment"
            amount="- ₹2,499"
          />
        </CardContent>
      </Card>


      {/* Summary cards */}
      

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

          {/* Chart placeholder */}
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
              Spending chart
            </Typography>
          </Box>
        </CardContent>
      </Card>
      {/* Spending section */}
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
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">
                  Income
                </Typography>

                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
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

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">
                  Expenses
                </Typography>

                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
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

        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">
                  Net Balance
                </Typography>

                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
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

      <AddExpenseDialog
        open={expenseDialogOpen}
        onClose={() => setExpenseDialogOpen(false)}
      />
    </Box>
  );
}

type ActivityRowProps = {
  title: string;
  category: string;
  amount: string;
};

function ActivityRow({
  title,
  category,
  amount,
}: ActivityRowProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ py: 2 }}
    >
      <Box>
        <Typography fontWeight={500}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {category}
        </Typography>
      </Box>

      <Typography fontWeight={600}>
        {amount}
      </Typography>
    </Stack>
  );
}