import { Router } from "express";
import {
  createExpenseController,
  getExpenseCategoriesController,
  getExpensesController,
  updateExpenseController,
} from "../controllers/expense.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/categories", getExpenseCategoriesController);

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