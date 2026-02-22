"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import BudgetForm from "./BudgetForm";
import { Budget } from "@/src/schemas";
import { editBudget } from "@/actions/edit-budget-action";
import { useRouter } from "next/navigation";

export default function EditBudgetForm({ budget }: { budget: Budget }) {
  const router = useRouter();
  const editBudgetWithId = editBudget.bind(null, budget.id);
  const [state, dispatch] = useFormState(editBudgetWithId, {
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
      <BudgetForm budget={budget} />
      <input
        type="submit"
        className="bg-amber-500 w-full p-3 text-white uppercase font-bold hover:bg-amber-600 cursor-pointer transition-colors"
        value="Guardar Cambios"
      />
    </form>
  );
}
