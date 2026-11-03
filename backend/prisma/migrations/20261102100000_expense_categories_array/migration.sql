CREATE TYPE "ExpenseCategory" AS ENUM (
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Bad Habits',
  'Other'
);

ALTER TABLE "Expense"
ALTER COLUMN "category" TYPE "ExpenseCategory"[]
USING ARRAY[
  CASE
    WHEN "category" IN (
      'Food',
      'Transport',
      'Shopping',
      'Entertainment',
      'Bills',
      'Health',
      'Bad Habits',
      'Other'
    ) THEN "category"::"ExpenseCategory"
    ELSE 'Other'::"ExpenseCategory"
  END
];

ALTER TABLE "Expense"
RENAME COLUMN "category" TO "categories";
