import { DraftExpense } from "@/src/schemas";

type ExpenseFormProps = {
  expense?: DraftExpense;
};

export default function ExpenseForm({ expense }: ExpenseFormProps) {
  return (
    <>
      <div className="mb-5">
        <label htmlFor="name" className="text-sm uppercase font-bold">
          Nombre Gasto
        </label>
        <input
          id="name"
          className="w-full p-3  border border-gray-100  bg-white"
          type="text"
          placeholder="Nombre del Gasto"
          name="name"
          defaultValue={expense?.name}
        />
      </div>

      <div className="mb-5">
        <label htmlFor="amount" className="text-sm uppercase font-bold">
          Cantidad Gasto
        </label>
        <input
          id="amount"
          className="w-full p-3  border border-gray-100 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          type="number"
          placeholder="Cantidad Gasto"
          name="amount"
          defaultValue={expense?.amount}
        />
      </div>
    </>
  );
}
