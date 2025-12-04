// 📌 Importar reglas centralizadas
import {
  validateAmount,
  validateInstallments,
  validateMonthlyPayment,
  validateDueDate,
  validateContributors,
  validateContributionsMatchAmount,
  validatePaymentConsistency,
} from "./debtRules.js";

// ✅ Middleware para actualización parcial (PATCH)
export default function validateDebtPartialUpdate(req, res, next) {
  const {
    debt_name,
    creditor_name,
    amount,
    installments,
    monthly_payment,
    due_date,
    contributors,
  } = req.body;

  // --- 1. Validar amount si viene ---
  if (amount !== undefined) {
    const amountError = validateAmount(amount);
    if (amountError) {
      return res.status(400).json({ error: amountError });
    }
  }

  // --- 2. Validar installments si viene ---
  if (installments !== undefined) {
    const installmentsError = validateInstallments(installments);
    if (installmentsError) {
      return res.status(400).json({ error: installmentsError });
    }
  }

  // --- 3. Validar monthly_payment si viene ---
  if (monthly_payment !== undefined) {
    const monthlyPaymentError = validateMonthlyPayment(monthly_payment);
    if (monthlyPaymentError) {
      return res.status(400).json({ error: monthlyPaymentError });
    }
  }

  // --- 4. Validar due_date si viene ---
  if (due_date !== undefined) {
    const dueDateError = validateDueDate(due_date);
    if (dueDateError) {
      return res.status(400).json({ error: dueDateError });
    }
  }

  // --- 5. Validar contributors si viene ---
  if (contributors !== undefined) {
    const contributorsError = validateContributors(contributors);
    if (contributorsError) {
      return res.status(400).json({ error: contributorsError });
    }
  }

  // --- 6. Validar relación amount = suma aportes (si vienen ambos) ---
  if (contributors !== undefined && amount !== undefined) {
    const sumError = validateContributionsMatchAmount(contributors, amount);
    if (sumError) {
      return res.status(400).json({ error: sumError });
    }
  }

  // --- 7. Validar amount ≈ installments * monthly_payment ---
  if (
    amount !== undefined &&
    installments !== undefined &&
    monthly_payment !== undefined
  ) {
    const consistencyError = validatePaymentConsistency(
      amount,
      installments,
      monthly_payment
    );

    if (consistencyError) {
      return res.status(400).json({ error: consistencyError });
    }
  }

  next();
}
