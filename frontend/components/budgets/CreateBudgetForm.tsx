"use client";

import { createBudget } from "@/actions/create-budget-action";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import BudgetForm from "./BudgetForm";

export default function CreateBudgetForm() {
  const router = useRouter();
  const [state, dispatch] = useFormState(createBudget, {
    errors: [],
    success: "",
  });

  useEffect(() => {
    if (state.errors) {
      state.errors.forEach((error) => {
        toast.error(error);
      });
    }

    if (state.success) {
      toast.success(state.success);
      router.push("/admin");
    }
  }, [state]);

  return (
    <form className="mt-10 space-y-3" noValidate action={dispatch}>
      <BudgetForm />
      <input
        type="submit"
        className="bg-amber-500 w-full p-3 text-white uppercase font-bold hover:bg-amber-600 cursor-pointer transition-colors"
        value="Crear Presupuesto"
      />
    </form>
  );
}
