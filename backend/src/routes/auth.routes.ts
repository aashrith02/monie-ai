import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { createExpenseController } from "../controllers/expense.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/addExpenses", createExpenseController);

export default router;