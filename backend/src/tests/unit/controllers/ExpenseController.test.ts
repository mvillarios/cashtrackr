import { createRequest, createResponse } from "node-mocks-http";
import { budgets } from "../../mocks/budget";
import { expenses } from "../../mocks/expenses";
import { BudgetController } from "../../../controllers/BudgetController";
import Budget from "../../../models/Budget";
import Expense from "../../../models/Expense";
import { ExpensesController } from "../../../controllers/ExpenseController";

jest.mock("../../../models/Expense", () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
}));

describe("ExpensesController.create", () => {
  it("Should create a new expense", async () => {
    const mockExpense = {
      save: jest.fn().mockResolvedValue(true),
    };
    (Expense.create as jest.Mock).mockResolvedValue(mockExpense);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Gasto de prueba", amount: 500 },
      budget: { id: 1 },
    });
    const res = createResponse();
    await ExpensesController.create(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(201);
    expect(data).toBe("Gasto creado con éxito");
    expect(mockExpense.save).toHaveBeenCalled();
    expect(mockExpense.save).toHaveBeenCalledTimes(1);
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });

  it("Should handle errors when creating a expense", async () => {
    const mockExpense = {
      save: jest.fn(),
    };

    (Expense.create as jest.Mock).mockRejectedValue(new Error());
    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      user: { id: 1 },
      body: { name: "Gasto de prueba", amount: 500 },
    });
    const res = createResponse();
    await ExpensesController.create(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
    expect(data).toStrictEqual({ error: "Error al crear el gasto" });
    expect(mockExpense.save).not.toHaveBeenCalled();
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });
});

describe("ExpensesController.getById", () => {
  it("should return a expense with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenses[0],
    });
    const res = createResponse();
    await ExpensesController.getById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toEqual(expenses[0]);
  });
});

describe("ExpensesController.updateById", () => {
  it("should handle expense update", async () => {
    const expenseMock = {
      ...expenses[0],
      update: jest.fn().mockResolvedValue(true),
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
      body: { name: "Gasto actualizado", amount: 750 },
    });
    const res = createResponse();
    await ExpensesController.updateById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toEqual("Gasto actualizado con éxito");
    expect(expenseMock.update).toHaveBeenCalledWith(req.body);
    expect(expenseMock.update).toHaveBeenCalledTimes(1);
  });
});

describe("ExpensesController.deleteById", () => {
  it("should delete a expense ", async () => {
    const expenseMock = {
      destroy: jest.fn().mockResolvedValue(true),
    };

    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenseMock,
    });
    const res = createResponse();
    await ExpensesController.deleteById(req, res);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(200);
    expect(data).toBe("Gasto eliminado con éxito");
    expect(expenseMock.destroy).toHaveBeenCalled();
    expect(expenseMock.destroy).toHaveBeenCalledTimes(1);
  });
});
