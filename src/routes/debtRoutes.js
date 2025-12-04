// routes/debtRoutes.js
import { Router } from "express";

import {
  createDebt,
  getAllDebts,
  getDebtById,
  updateDebtById,
  patchDebtById,
  removeDebt,
  restoreDebtController,
  getActiveDebts,
  getDebtsByContributor,
  getContributionsReport,
} from "../controllers/debtController.js";

// Middlewares separados correctamente
import validateDebt from "../middlewares/validateDebt.js";
import validateDebtFullUpdate from "../middlewares/validateDebtFullUpdate.js";
import validateDebtPartialUpdate from "../middlewares/validateDebtPartialUpdate.js";

const router = Router();

// 🟢 Crear una deuda
router.post("/", validateDebt, createDebt);

// 🟢 Obtener todas las deudas
router.get("/", getAllDebts);

// 🟢 Obtener solo deudas activas (antes de :id)
router.get("/active", getActiveDebts);

// 🟢 Obtener deuda específica
router.get("/:id", getDebtById);

// 🟡 Actualización completa (PUT)
router.put("/:id", validateDebtFullUpdate, updateDebtById);

// 🟡 Actualización parcial (PATCH)
router.patch("/:id", validateDebtPartialUpdate, patchDebtById);

// 🔴 Eliminar deuda
router.delete("/:id", removeDebt);

// 🟢 Restaurar deuda eliminada
router.patch("/:id/restore", restoreDebtController);

// 🟢 Obtener deudas por contribuyente
router.get("/by-contributor/:id", getDebtsByContributor);

// 🟢 Reporte de contribuciones
router.get("/contributions/report", getContributionsReport);

export default router;

