import { cache } from "react";
import getToken from "@/src/auth/token";
import { BudgetAPIResponseSchema } from "@/src/schemas";
import { notFound } from "next/navigation";

export const getBudget = cache(async (budgetId: string) => {
  const token = getToken();
  const url = `${process.env.API_URL}/budgets/${budgetId}`;
  const req = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      tags: ["budget"],
    },
  });

  if (!req.ok) {
    notFound();
  }

  const json = await req.json();
  const budget = BudgetAPIResponseSchema.parse(json);
  return budget;
});
