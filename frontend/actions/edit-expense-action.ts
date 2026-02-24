"use server";

import getToken from "@/src/auth/token";
import {
  Budget,
  DraftExpenseSchema,
  ErrorResponseSchema,
  Expense,
  SuccessSchema,
} from "@/src/schemas";
import { revalidateTag } from "next/cache";

type BudgetAndExpenseIds = {
  budgetId: Budget["id"];
  expenseId: Expense["id"];
};

type ActionStateType = {
  errors: string[];
  success: string;
};

export default async function editExpense(
  { budgetId, expenseId }: BudgetAndExpenseIds,
  prevState: ActionStateType,
  formData: FormData,
) {
  const expense = DraftExpenseSchema.safeParse({
    name: formData.get("name"),
    amount: formData.get("amount"),
  });

  if (!expense.success) {
    return {
      errors: expense.error.issues.map((error) => error.message),
      success: "",
    };
  }

  //Actualizar gasto
  const token = getToken();
  const url = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;
  const req = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: expense.data.name,
      amount: expense.data.amount,
    }),
  });

  const json = await req.json();
  if (!req.ok) {
    const { error } = ErrorResponseSchema.parse(json);
    return {
      errors: [error],
      success: "",
    };
  }

  revalidateTag("budget");

  const success = SuccessSchema.parse(json);
  return {
    errors: [],
    success,
  };
}
