import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export type CreateExpenseInput = {
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
};

export async function createExpense(
  userId: string,
  input: CreateExpenseInput
) {
  const expense = await prisma.expense.create({
    data: {
      title: input.title,
      amount: input.amount,
      category: input.category,
      date: new Date(input.date),
      userId,
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });

  return expense;
}