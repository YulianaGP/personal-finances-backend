// 📌 Importar reglas centralizadas
import {
  validateRequiredFields,
  validateAmount,
  validateInstallments,
  validateMonthlyPayment,
  validateDueDate,
  validateContributors,
  validateContributionsMatchAmount,
  validatePaymentConsistency,
} from "./debtRules.js";

// ✅ Middleware para crear una deuda nueva (POST)
export default function validateDebt(req, res, next) {
  const {
    debt_name,
    creditor_name,
    amount,
    installments,
    monthly_payment,
    due_date,
    contributors,
  } = req.body;

  // --- 1. Validar campos obligatorios ---
  const requiredError = validateRequiredFields(req.body, [
    "debt_name",
    "creditor_name",
    "amount",
    "due_date",
  ]);
  if (requiredError) {
    return res.status(400).json({ error: requiredError });
  }

  // --- 2. Validar amount ---
  const amountError = validateAmount(amount);
  if (amountError) {
    return res.status(400).json({ error: amountError });
  }

  // --- 3. Validar installments ---
  const installmentsError = validateInstallments(installments);
  if (installmentsError) {
    return res.status(400).json({ error: installmentsError });
  }

  // --- 4. Validar monthly_payment ---
  const monthlyPaymentError = validateMonthlyPayment(monthly_payment);
  if (monthlyPaymentError) {
    return res.status(400).json({ error: monthlyPaymentError });
  }

  // --- 5. Validar due_date ---
  const dueDateError = validateDueDate(due_date);
  if (dueDateError) {
    return res.status(400).json({ error: dueDateError });
  }

  // --- 6. Validar contribuyentes ---
  const contributorsError = validateContributors(contributors);
  if (contributorsError) {
    return res.status(400).json({ error: contributorsError });
  }

  // --- 7. Validar suma de aportes =
  const contributionSumError = validateContributionsMatchAmount(contributors, amount);
  if (contributionSumError) {
    return res.status(400).json({ error: contributionSumError });
  }

  // --- 8. Validar consistencia cuotas * pago mensual ≈ amount ---
  const consistencyError = validatePaymentConsistency(amount, installments, monthly_payment);
  if (consistencyError) {
    return res.status(400).json({ error: consistencyError });
  }

  next();
}
