"use server";

import getToken from "@/src/auth/token";
import {
  Budget,
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

export default async function deleteExpense(
  { budgetId, expenseId }: BudgetAndExpenseIds,
  prevState: ActionStateType,
) {
  //Eliminar Gasto
  const token = getToken();
  const url = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;
  const req = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
