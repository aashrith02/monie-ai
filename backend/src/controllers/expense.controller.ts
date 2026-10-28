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


    const month = req.query.month;
    const from = req.query.from;
    const to = req.query.to;
    const hasDateRange = from !== undefined || to !== undefined;
    const isValidDate = (value: unknown): value is string => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
      }

      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    };

    if (month !== undefined) {
      if (
        typeof month !== "string" ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
      ) {
        return res.status(400).json({
          message: "Month must be in YYYY-MM format",
        });
      }
    }

    if (hasDateRange) {
      if (
        month !== undefined ||
        !isValidDate(from) ||
        !isValidDate(to) ||
        from > to ||
        Date.parse(`${to}T00:00:00.000Z`) -
          Date.parse(`${from}T00:00:00.000Z`) >
          48 * 24 * 60 * 60 * 1000
      ) {
        return res.status(400).json({
          message: "Provide a valid date range of 49 days or less",
        });
      }
    }

    const numberOfExpenses = parseInt(req.query.numberOfExpenses as string) || 10;

    const expenses = await getExpensesByUserId(
      userId,
      numberOfExpenses,
      typeof month === "string" ? month : undefined,
      isValidDate(from) && isValidDate(to) ? { from, to } : undefined,
    );
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
