import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import Budget from "../models/Budget";
import { handleInputErrors } from "./validation";

declare global {
  namespace Express {
    interface Request {
      budget?: Budget;
    }
  }
}

export const validateBudgetId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await param("budgetId")
    .isInt()
    .withMessage("ID no válido")
    .custom((value) => value > 0)
    .withMessage("ID no válido")
    .run(req);

  handleInputErrors(req, res, next);
};

export const validateBudgetExists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { budgetId } = req.params;
    const budget = await Budget.findByPk(budgetId as string);
    if (!budget) {
      const error = new Error("Presupuesto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    req.budget = budget;

    next();
  } catch (error) {
    //console.log(error);
    res.status(500).json({ error: "Error al obtener el presupuesto" });
  }
};

export const validateBudgetInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await body("name")
    .notEmpty()
    .withMessage("Nombre del presupuesto es obligatorio")
    .run(req);
  await body("amount")
    .notEmpty()
    .withMessage("Monto del presupuesto es obligatorio")
    .isNumeric()
    .withMessage("Cantidad no es un número válido")
    .custom((value) => value > 0)
    .withMessage("El monto debe ser un número mayor que cero")
    .run(req);

  next();
};
