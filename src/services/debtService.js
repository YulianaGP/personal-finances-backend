// services/debtService.js
import prisma from "../config/db.js";

// ✅ 1. Función para normalizar nombres (acentos, mayúsculas, espacios)
function normalizeName(name) {
  return String(name || "")
    .normalize("NFD") // separa caracteres y acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .toLowerCase() // todo en minúsculas
    .trim(); // sin espacios al inicio o final
}

// Convierte un valor a número seguro
function toNumberSafe(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// Valida que un valor sea un monto positivo
function validatePositiveMoney(v) {
const n = toNumberSafe(v);
return Number.isFinite(n) && n > 0;
}

// ✅ 2. CRUD - Create Debt with Contributors
export async function createDebtWithContributors(payload) {
  const {
    debt_name,
    creditor_name,
    amount,
    installments,
    monthly_payment,
    due_date,
    contributors
  } = payload;

  // Validaciones básicas
  if (!debt_name) throw new Error("debt_name is required");
if (!creditor_name) throw new Error("creditor_name is required");
if (!validatePositiveMoney(amount)) throw new Error("amount is required and must be a positive number");
if (!Number.isInteger(Number(installments)) || Number(installments) <= 0) throw new Error("installments must be a positive integer");
if (!validatePositiveMoney(monthly_payment)) throw new Error("monthly_payment is required and must be positive");
if (!due_date) throw new Error("due_date is required");
if (!Array.isArray(contributors) || contributors.length < 1) throw new Error("At least one contributor is required");

  // Validar due_date
  const parsedDue = new Date(due_date);
  if (isNaN(parsedDue.getTime())) throw new Error("Invalid due_date format");

  // Validar suma de aportes === monthly_payment
  let sum = 0;
  for (const c of contributors) {
    if (!c || typeof c !== "object") throw new Error("Each contributor must be an object");
    if (!c.name || String(c.name).trim() === "") throw new Error("Contributor must have a name");
    if (!validatePositiveMoney(c.contribution_amount)) throw new Error("Each contributor must have a positive contribution_amount");
    sum += Number(c.contribution_amount);
  }

  if (Math.abs(sum - Number(monthly_payment)) > MONEY_TOLERANCE) {
    throw new Error(`Total contributions (${sum.toFixed(2)}) do not match monthly_payment (${Number(monthly_payment).toFixed(2)})`);
  }

  // Transacción: crear deuda y relaciones de contributors
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.debt.findUnique({ where: { debt_name } });
    if (existing) {
      throw new Error("debt_name already exists");
    }

    // // Usamos create con nested connectOrCreate si es posible. Si connect falla por no-unique, se maneja en update/readdir.
    const debt = await tx.debt.create({
      data: {
        debt_name,
        creditor_name,
        amount: formatMoneyToString(amount),
        installments: Math.trunc(Number(installments)),
        monthly_payment: formatMoneyToString(monthly_payment),
        due_date: parsedDue,
        contributors: {
          create: contributors.map((c, idx) => {
            const normalizedContributorName = normalizeName(c.name);

            return {
              contribution_amount: formatMoneyToString(c.contribution_amount),
              is_primary: idx === 0,
              contributor: {
                connectOrCreate: {
                  where: { name: normalizedContributorName },
                  create: { name: normalizedContributorName }
                }
              }
            };
          })
        }
      },
      include: {
        contributors: {
          include: { contributor: true }
        }
      }
    });

    return debt;
  });
}

// ✅ 3. CRUD - Read (Get All Debts) con soporte para soft delete y filtros
export async function getAllDebtsService(params = {}) {
  const { includeDeleted = false, onlyDeleted = false } = params;

  // Construimos el "where" dinámicamente
  let whereClause = {};

  if (onlyDeleted) {
    // ✅ Solo soft-deleted
    whereClause = {
      OR: [
        { is_deleted: true },
        { deletedAt: { not: null } }
      ]
    };
  } else if (!includeDeleted) {
    // ✅ Sólo activas
    whereClause = {
      AND: [
        { is_deleted: false },
        { deletedAt: null }
      ]
    };
  }
  // Si includeDeleted == true, no filtramos nada

  return await prisma.debt.findMany({
    where: whereClause,
    include: {
      contributors: {
        include: { contributor: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

// ✅ 4. CRUD - Read (Get Debt by ID) - Optional
export async function getDebtByIdService(id) {
  const debtId = Number(id);
  if (!Number.isInteger(debtId)) throw new Error("Invalid id");

  return await prisma.debt.findUnique({
    where: { id: debtId },
    include: { contributors: { include: { contributor: true } } }
  });
}

// ✅ 5. CRUD - Actualizar deuda por ID (PUT/PATCH) — soporta reemplazo de contributors
export async function updateDebtByIdService(id, data, options = { partial: false }) {
  const partial = !!options.partial;
  const debtId = Number(id);
  if (!Number.isInteger(debtId)) throw new Error("Invalid id");

  return await prisma.$transaction(async (tx) => {
    // Load current debt + contributors
    const existing = await tx.debt.findUnique({
      where: { id: debtId },
      include: { contributors: { include: { contributor: true } } },
    });

    if (!existing) throw new Error("Debt not found");

    // Resolve values (PATCH keeps existing when undefined)
    const resolved = {
      debt_name: partial ? (data.debt_name ?? existing.debt_name) : data.debt_name,
      creditor_name: partial ? (data.creditor_name ?? existing.creditor_name) : data.creditor_name,
      amount: partial
        ? (data.amount !== undefined ? toNumberSafe(data.amount) : toNumberSafe(existing.amount))
        : toNumberSafe(data.amount),
      installments: partial
        ? (data.installments !== undefined ? Math.trunc(Number(data.installments)) : existing.installments)
        : Math.trunc(Number(data.installments)),
      monthly_payment: partial
        ? (data.monthly_payment !== undefined ? toNumberSafe(data.monthly_payment) : toNumberSafe(existing.monthly_payment))
        : toNumberSafe(data.monthly_payment),
      due_date: partial ? (data.due_date ?? existing.due_date) : data.due_date,
    };

    // Basic service-level checks for PUT
    if (!partial) {
      if (resolved.debt_name === undefined) throw new Error("debt_name required for PUT");
      if (resolved.creditor_name === undefined) throw new Error("creditor_name required for PUT");
      if (!Number.isFinite(resolved.amount)) throw new Error("amount required for PUT");
      if (!resolved.due_date) throw new Error("due_date required for PUT");
    }

    // Validate due_date format if provided
    if (resolved.due_date !== undefined) {
      const parsed = new Date(resolved.due_date);
      if (isNaN(parsed.getTime())) throw new Error("Invalid due_date format");
    }

    // If contributors provided -> replace them
    if (data.contributors !== undefined) {
      const contributors = data.contributors;
      if (!Array.isArray(contributors) || contributors.length < 1) {
        throw new Error("At least one contributor is required when 'contributors' is provided");
      }

      // validate each contributor and compute total
      let total = 0;
      for (const c of contributors) {
        if (!c || typeof c !== "object") throw new Error("Each contributor must be an object");
        if (!c.name || String(c.name).trim() === "") throw new Error("Contributor must have a name");
        if (!validatePositiveMoney(c.contribution_amount)) throw new Error("Each contributor must have a positive contribution_amount");
        total += Number(c.contribution_amount);
      }
        
      if (!Number.isFinite(resolved.monthly_payment)) throw new Error("monthly_payment is required to validate contributors");
      if (Math.abs(total - Number(resolved.monthly_payment)) > MONEY_TOLERANCE) {
        throw new Error(`Total contributions (${total.toFixed(2)}) must match monthly_payment (${Number(resolved.monthly_payment).toFixed(2)})`);
      }

      // replace relations atomically
      await tx.debtContributor.deleteMany({ where: { debtId } });

      // ensure contributor records exist (find or create) then create debtContributor
      for (let i = 0; i < contributors.length; i++) {
        const c = contributors[i];
        const normalized = normalizeName(c.name);

        // Intentamos findFirst con insensitive para mayor robustez
        let contributorRecord = await tx.contributor.findFirst({
          where: { name: { equals: normalized, mode: "insensitive" } },
        });

        if (!contributorRecord) {
          contributorRecord = await tx.contributor.create({ data: { name: normalized } });
        }

        await tx.debtContributor.create({
          data: {
            debtId,
            contributorId: contributorRecord.id,
            contribution_amount: formatMoneyToString(c.contribution_amount),
            is_primary: i === 0,
          },
        });
      }
    } else {
      // contributors not provided
      const monthlyChanged = data.monthly_payment !== undefined && Number(data.monthly_payment) !== Number(existing.monthly_payment);
      if (monthlyChanged) {
        const currentContributors = existing.contributors || [];
        const total = currentContributors.reduce((s, dc) => s + Number(dc.contribution_amount), 0);
        if (Math.abs(total - Number(resolved.monthly_payment)) > MONEY_TOLERANCE) {
          throw new Error("New monthly_payment does not match sum of existing contributors — provide contributors or adjust monthly_payment");
        }
      }
    }

    // Update debt row
    const updated = await tx.debt.update({
      where: { id: debtId },  
      data: {
        ...(resolved.debt_name !== undefined && { debt_name: resolved.debt_name }),
        ...(resolved.creditor_name !== undefined && { creditor_name: resolved.creditor_name }),
        ...(resolved.amount !== undefined && { amount: formatMoneyToString(resolved.amount) }),
        ...(resolved.installments !== undefined && { installments: Math.trunc(resolved.installments) }),
        ...(resolved.monthly_payment !== undefined && { monthly_payment: formatMoneyToString(resolved.monthly_payment) }),
        ...(resolved.due_date !== undefined && { due_date: new Date(resolved.due_date) }),
      },
      include: {
        contributors: { include: { contributor: true } },
      },
    });

    return updated;
  });
}

// ✅ 6. CRUD -Eliminar deuda por ID
export async function deleteDebt(id, force = false) {
  const debtId = Number(id);
  if (!Number.isInteger(debtId)) throw new Error("Invalid id");

  // ✅ Verificar si existe
  const existing = await prisma.debt.findUnique({ where: { id: debtId }, include: { contributors: true } });
  if (!existing) throw new Error("Debt not found");

  // ✅ Hard delete (force = true)
  if (force) {
    // Eliminar relaciones
    await prisma.debtContributor.deleteMany({ where: { debtId } });

    // Eliminar deuda
    await prisma.debt.delete({ where: { id: debtId } });

    return { message: "Debt permanently deleted" };
  }

  // ✅ Soft delete (por defecto)
  const now = new Date();
  await prisma.debt.update({ where: { id: debtId }, data: { is_deleted: true, deletedAt: now } });
  return { message: "Debt soft deleted", deletedAt: now };
}
// ✅ Restaurar (undelete) deuda
export async function restoreDebt(id) {
  const debtId = Number(id);
  if (!Number.isInteger(debtId)) throw new Error("Invalid id");

  // Verificar existencia
  const existing = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!existing) throw new Error("Debt not found");

  // Verificar que esté eliminada
  if (!existing.is_deleted && existing.deletedAt === null) {
    throw new Error("Debt is not deleted");
  }

  // Restaurar
  const restored = await prisma.debt.update({ where: { id: debtId }, data: { is_deleted: false, deletedAt: null } });
  return { message: "Debt restored successfully", data: restored };
}

// Servicio adicional para obtener solo deudas activas (no eliminadas)
// ✅ Obtener deudas activas (is_deleted = false)
export async function getActiveDebtsService() {
  return getAllDebtsService({ includeDeleted: false });
}

// Servicio adicional para obtener deudas por contribuyente
export async function getDebtsByContributorService(contributorId) {
  return await prisma.debt.findMany({
    where: {
      contributors: { some: { contributorId: Number(contributorId) } },
      AND: [ { is_deleted: false }, { deletedAt: null } ]
    },
    include: {
      contributors: {
        where: { contributorId: Number(contributorId) },
        select: {
          contribution_amount: true,
          is_primary: true,
          contributor: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

// Servicio adicional para reporte de contribuciones totales por contribuyente
export async function getContributionsReportService() {
  const grouped = await prisma.debtContributor.groupBy({
    by: ["contributorId"],
    _sum: { contribution_amount: true },
    _count: { debtId: true }
  });

  const results = await Promise.all(grouped.map(async (item) => {
    const contributor = await prisma.contributor.findUnique({ where: { id: item.contributorId }, select: { name: true } });
    return {
      contributorId: item.contributorId,
      contributorName: contributor?.name || null,
      totalContribution: item._sum.contribution_amount,
      numberOfDebts: item._count.debtId
    };
  }));

  return results;
}
