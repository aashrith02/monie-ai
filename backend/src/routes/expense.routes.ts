import { Router } from "express";
import { createExpenseController } from "../controllers/expense.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/addExpenses",
  authenticateToken,
  createExpenseController
);

export default router;