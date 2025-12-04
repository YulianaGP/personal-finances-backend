// src/controllers/debtController.js
import {
  createDebtWithContributors,
  getAllDebtsService,
  getDebtByIdService,
  updateDebtByIdService,
  deleteDebt,
  restoreDebt, 
  getActiveDebtsService,
  getDebtsByContributorService,
  getContributionsReportService,
} from "../services/debtService.js";

// ✅ CRUD - Create
export async function createDebt(req, res) {
  try {
    const debt = await createDebtWithContributors(req.body);
    res.status(201).json(debt);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// ✅ CRUD - Read (Get All Debts)
export async function getAllDebts(req, res) {
  try {
    const { includeDeleted, onlyDeleted } = req.query;

    const debts = await getAllDebtsService({
      includeDeleted: includeDeleted === "true",
      onlyDeleted: onlyDeleted === "true",
    });

    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ CRUD - GET /:id
export async function getDebtById(req, res) {
  try {
    const { id } = req.params;
    const debt = await getDebtByIdService(id);

    if (!debt) {
      return res.status(404).json({ error: "Debt not found" });
    }

    res.status(200).json(debt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ CRUD - PUT /:id
export async function updateDebtById(req, res) {
  try {
    const { id } = req.params;
    const updatedDebt = await updateDebtByIdService(id, req.body, { partial: true });

    res.status(200).json({
      message: "Debt updated successfully",
      data: updatedDebt,
    });
  } catch (error) {
    if (error.message === "Debt not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
}

// ✅ CRUD - DELETE 
export async function removeDebt(req, res) {
  try {
    const { id } = req.params;
    const force = req.query.force === "true"; // ?force=true

    const result = await deleteDebt(id, force);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Debt not found") {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

// ✅ CRUD - PATCH /:id (actualización parcial)
export async function patchDebtById(req, res) {
  try {
    const { id } = req.params;

    const updatedDebt = await updateDebtByIdService(id, req.body, { partial: true });

    res.status(200).json({
      message: "Debt patched successfully",
      data: updatedDebt,
    });
  } catch (error) {
    if (error.message === "Debt not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
}

// ✅ PATCH /api/debts/:id/restore
export async function restoreDebtController(req, res) {
  try {
    const { id } = req.params;
    const restored = await restoreDebt(id);

    res.status(200).json({
      message: "Debt restored successfully",
      data: restored,
    });
  } catch (error) {
    // ✅ Errores específicos
    if (error.message === "Debt not found") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Debt is not deleted") {
      return res.status(400).json({ error: error.message });
    }

    // ✅ Errores inesperados
    res.status(500).json({ error: "Unexpected error", details: error.message });
  }
}

// ✅ Obtener deudas activas (no eliminadas)
export async function getActiveDebts(req, res) {
  try {
    const debts = await getActiveDebtsService();
    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Obtener deudas por contribuyente
export async function getDebtsByContributor(req, res) {
  try {
    const { id } = req.params;
    const debts = await getDebtsByContributorService(id);

    if (!debts || debts.length === 0) {
      return res.status(404).json({ message: "No debts found for this contributor" });
    }

    res.status(200).json(debts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Reporte de contribuciones totales por contribuyente
export async function getContributionsReport(req, res) {
  try {
    const report = await getContributionsReportService();
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
