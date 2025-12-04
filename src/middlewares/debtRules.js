// 📌 Validar campos obligatorios (solo para POST y PUT)
export function validateRequiredFields(body, requiredFields = []) {
  for (const field of requiredFields) {
    const val = body[field];
    if (val === undefined || val === null) {
      return `El campo '${field}' es obligatorio.`;
    }
    if (typeof val === "string" && val.trim() === "") {
      return `El campo '${field}' no puede quedar vacío.`;
    }
  }
  return null;
}

// 📌 Validar 'amount'
export function validateAmount(amount) {
  if (amount === undefined || amount === null) return null;
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) {
    return "'amount' debe ser un número positivo.";
  }
  return null;
}

// 📌 Validar 'installments' (debe ser entero positivo)
export function validateInstallments(installments) {
  if (installments === undefined || installments === null) return null;
  const n = Number(installments);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
    return "'installments' debe ser un entero positivo.";
  }
  return null;
}

// 📌 Validar 'monthly_payment'
export function validateMonthlyPayment(monthly_payment) {
  if (monthly_payment === undefined || monthly_payment === null) return null;
  const n = Number(monthly_payment);
  if (!Number.isFinite(n) || n <= 0) {
    return "'monthly_payment' debe ser un número positivo.";
  }
  return null;
}

// 📌 Validar fecha 'due_date'
export function validateDueDate(due_date) {
  if (due_date === undefined || due_date === null) return null;
  const parsed = Date.parse(due_date);
  if (isNaN(parsed)) {
    return "'due_date' debe tener un formato de fecha válido.";
  }
  return null;
}

// 📌 Validar contribuyentes (reglas principales)
export function validateContributors(contributors) {
  if (!Array.isArray(contributors) || contributors.length < 1) {
    return "Debe haber al menos un contribuyente.";
  }

  for (const contributor of contributors) {
    if (!contributor || typeof contributor !== "object") {
      return "Cada contribuyente debe ser un objeto con 'name' y 'contribution_amount'.";
    }

    if (!contributor.name || typeof contributor.name !== "string" || contributor.name.trim() === "") {
      return "Cada contribuyente debe incluir un 'name' válido.";
    }

    const amt = Number(contributor.contribution_amount);
    if (
      contributor.contribution_amount === undefined ||
      !Number.isFinite(amt) ||
      amt <= 0
    ) {
      return "Cada contribuyente debe incluir 'contribution_amount' como un número positivo.";
    }
  }

  return null;
}

// 📌 Validar suma de aportes = amount (tolerancia opcional)
export function validateContributionsMatchAmount(contributors, amount, tolerance = 0.01) {
  if (!contributors || amount === undefined || amount === null) return null;

  const total = contributors.reduce((sum, c) => sum + Number(c.contribution_amount), 0);
  const target = Number(amount);

  if (!Number.isFinite(total) || !Number.isFinite(target)) {
    return "Error al sumar aportes o al leer el monto total.";
  }

  if (Math.abs(total - target) > tolerance) {
    return `La suma de los aportes (${total}) debe ser igual al monto total (${target}).`;
  }

  return null;
}

// 📌 Validar monto ≈ installments * monthly_payment
// toleranceAmount: diferencia aceptable en unidades monetarias (por defecto 5)
export function validatePaymentConsistency(amount, installments, monthly_payment, toleranceAmount = 5) {
  if (installments === undefined || monthly_payment === undefined || amount === undefined) return null;

  const calculated = Number(installments) * Number(monthly_payment);
  const target = Number(amount);

  if (!Number.isFinite(calculated) || !Number.isFinite(target)) {
    return "Error en cálculos de cuotas o monto.";
  }

  if (Math.abs(calculated - target) > toleranceAmount) {
    return `El monto total (${target}) no coincide con cuotas * pago mensual (${calculated}).`;
  }

  return null;
}
