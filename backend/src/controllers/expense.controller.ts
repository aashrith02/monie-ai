import { type Request, type Response } from "express";
import {
  createExpense,
  getExpensesByUserId,
  getExpenseById,
  type CreateExpenseInput,
  updateExpense
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

export async function getExpensesController (req: Request, res: Response) {
  req: Request;
  res: Response;
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const expenseId = req.params.expenseId;
    if (typeof expenseId === "string") {
      const expense = await getExpenseById(expenseId);
      if (!expense) {
        return res.status(404).json({
          message: "Expense not found",
        });
      }
      return res.status(200).json({
        message: "Expense retrieved successfully",
        expense,
      });
    }


    const numberOfExpenses = parseInt(req.query.numberOfExpenses as string) || 10;

    const expenses = await getExpensesByUserId(userId, numberOfExpenses);
    return res.status(200).json({
      message: "Expenses retrieved successfully",
      expenses,
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


export async function updateExpenseController(req: Request, res: Response) {
  req: Request;
  res: Response;  
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const expenseId = req.params.id;

    const input: Partial<CreateExpenseInput> = req.body;

    const expense = await getExpenseById(expenseId);

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    if (expense.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const updatedExpense = await updateExpense(expenseId, input);

    return res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Update expense error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
