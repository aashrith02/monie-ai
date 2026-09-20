import { Router } from "express";
import { createExpenseController, getExpensesController,updateExpenseController } from "../controllers/expense.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/addExpenses",
  authenticateToken,
  createExpenseController
);

router.put(
  "/updateExpense/:id",
  authenticateToken,
  updateExpenseController
);

router.get(
  "/getExpenses",
  authenticateToken,
  getExpensesController
);


export default router;