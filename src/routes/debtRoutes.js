import { Router } from "express";
import {
  createDebt,
  getAllDebts,
  getDebtById,
  updateDebtById,
  removeDebt,
  restoreDebtController,
  getActiveDebts,
  getDebtsByContributor,
  getContributionsReport,
} from "../controllers/debtController.js";

const router = Router();

router.post("/", createDebt);
router.get("/", getAllDebts);
router.get("/active", getActiveDebts); // Nueva ruta para deudas activas (se escribe antes de la ruta con :id)
router.get("/:id", getDebtById);
router.put("/:id", updateDebtById);
router.delete("/:id", removeDebt);
router.patch("/:id/restore", restoreDebtController);
router.get("/by-contributor/:id", getDebtsByContributor);
router.get("/contributions/report", getContributionsReport);


export default router;
