import { Router } from "express";
import { body } from "express-validator";
import { BudgetController } from "../controllers/BudgetController";
import { handleInputErrors } from "../middleware/validation";
import {
  validateBudgetExists,
  validateBudgetId,
  validateBudgetInput,
} from "../middleware/budget";

const router = Router();

router.param("budgetId", validateBudgetId);
router.param("budgetId", validateBudgetExists);

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

export default router;
