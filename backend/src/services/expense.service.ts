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

export async function getExpensesByUserId(userId: string, numberOfExpenses: number) {
  return prisma.expense.findMany({
    where: {
      userId: userId,
    },
    take: numberOfExpenses !== undefined ? numberOfExpenses : 10,
  });
}

export async function getExpenseById(expenseId: string) {
  return prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
  });
}