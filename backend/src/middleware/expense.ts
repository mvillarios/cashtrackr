import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { handleInputErrors } from "./validation";
import Expense from "../models/Expense";

declare global {
  namespace Express {
    interface Request {
      expense?: Expense;
    }
  }
}

export const validateExpenseInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await body("name")
    .notEmpty()
    .withMessage("Nombre del gasto es obligatorio")
    .run(req);
  await body("amount")
    .notEmpty()
    .withMessage("Monto del gasto es obligatorio")
    .isNumeric()
    .withMessage("Cantidad no es un número válido")
    .custom((value) => value > 0)
    .withMessage("El monto debe ser un número mayor que cero")
    .run(req);

  next();
};

export const validateExpenseId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await param("expenseId")
    .isInt()
    .custom((value) => value > 0)
    .withMessage("ID no válido")
    .run(req);

  handleInputErrors(req, res, next);
};

export const validateExpenseExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findByPk(expenseId as string);
    if (!expense) {
      const error = new Error("Gasto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    req.expense = expense;
    next();
  } catch (error) {
    //console.log(error);
    res.status(500).json({ error: "Error al obtener el gasto" });
  }
};
