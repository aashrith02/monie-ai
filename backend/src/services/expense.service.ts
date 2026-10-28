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

export async function getExpensesByUserId(
  userId: string,
  numberOfExpenses: number,
  month?: string,
  dateRange?: { from: string; to: string },
) {
  const monthStart = month
    ? new Date(`${month}-01T00:00:00.000Z`)
    : undefined;
  const nextMonthStart =
    monthStart !== undefined
      ? new Date(
          Date.UTC(
            monthStart.getUTCFullYear(),
            monthStart.getUTCMonth() + 1,
            1,
          ),
        )
      : undefined;
  const rangeStart = dateRange
    ? new Date(`${dateRange.from}T00:00:00.000Z`)
    : undefined;
  const rangeEnd = dateRange
    ? new Date(`${dateRange.to}T00:00:00.000Z`)
    : undefined;
  if (rangeEnd) {
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);
  }

  return prisma.expense.findMany({
    where: {
      userId: userId,
      ...(monthStart !== undefined && nextMonthStart !== undefined
        ? { date: { gte: monthStart, lt: nextMonthStart } }
        : rangeStart !== undefined && rangeEnd !== undefined
          ? { date: { gte: rangeStart, lt: rangeEnd } }
          : {}),
    },
    orderBy:
      month !== undefined || dateRange !== undefined
        ? { date: "desc" }
        : { createdAt: "desc" },
    ...(month === undefined && dateRange === undefined
      ? { take: numberOfExpenses !== undefined ? numberOfExpenses : 10 }
      : {}),
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