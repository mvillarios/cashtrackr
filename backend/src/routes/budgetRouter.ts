import { Router } from "express";
import { body } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import {
  hasAccess,
  validateBudgetExists,
  validateBudgetId,
  validateBudgetInput,
} from "../middleware/budget";
import { ExpensesController } from "../controllers/ExpenseController";
import {
  validateExpenseExists,
  validateExpenseId,
  validateExpenseInput,
} from "../middleware/expense";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate); // req.user estará disponible en todas las rutas

router.param("budgetId", validateBudgetId);
router.param("budgetId", validateBudgetExists); // req.budget estará disponible en las rutas que tengan :budgetId
router.param("budgetId", hasAccess);

router.param("expenseId", validateExpenseId);
router.param("expenseId", validateExpenseExists);

router.get("/", BudgetController.getAll);
router.get("/:budgetId", BudgetController.getById);
router.delete("/:budgetId", BudgetController.deleteById);
router.post(
  "/",
  validateBudgetInput,
  handleInputErrors,
  BudgetController.create,
);
router.put(
  "/:budgetId",
  validateBudgetInput,
  handleInputErrors,
  BudgetController.updateById,
);

// Routes for expenses
// Patron ROA
// /budgets/:budgetId/expenses

//router.get("/:budgetId/expenses", ExpensesController.getAll);
router.get("/:budgetId/expenses/:expenseId", ExpensesController.getById);
router.delete("/:budgetId/expenses/:expenseId", ExpensesController.deleteById);
router.post(
  "/:budgetId/expenses",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.create,
);
router.put(
  "/:budgetId/expenses/:expenseId",
  validateExpenseInput,
  handleInputErrors,
  ExpensesController.updateById,
);

export default router;
