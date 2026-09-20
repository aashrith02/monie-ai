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

export async function updateExpense(expenseId: string, input: Partial<CreateExpenseInput>) {
  const updatedExpense = await prisma.expense.update({
    where: {
      id: expenseId,
    },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });

  return updatedExpense;
}