import { type Request, type Response } from "express";
import {
  createExpense,
  type CreateExpenseInput,
} from "../services/expense.service.js";

export async function createExpenseController(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const input: CreateExpenseInput = req.body;

    const expense = await createExpense(userId, input);

    return res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}