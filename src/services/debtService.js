// services/debtService.js
import prisma from "../config/db.js";

// ✅ 1. Función para normalizar nombres (acentos, mayúsculas, espacios)
function normalizeName(name) {
  return name
    .normalize("NFD") // separa caracteres y acentos
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .toLowerCase() // todo en minúsculas
    .trim(); // sin espacios al inicio o final
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

  // 2) Validaciones básicas
  if (!debt_name) throw new Error("debt_name is required");
  if (!creditor_name) throw new Error("creditor_name is required");
  if (!amount || !installments || !monthly_payment || !due_date) {
    throw new Error("Missing required fields");
  }
  if (!Array.isArray(contributors) || contributors.length < 1) {
    throw new Error("At least one contributor is required");
  }

  // 3) Validar suma de aportes === monthly_payment
  const sum = contributors.reduce(
    (s, c) => s + parseFloat(c.contribution_amount),
    0
  );
  if (Math.abs(sum - parseFloat(monthly_payment)) > 0.01) {
    throw new Error(
      `Total contributions (${sum.toFixed(
        2
      )}) do not match monthly_payment (${parseFloat(
        monthly_payment
      ).toFixed(2)})`
    );
  }

  // 4) Crear deuda + contributors con normalización
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.debt.findUnique({ where: { debt_name } });
    if (existing) {
      throw new Error("debt_name already exists");
    }

    const debt = await tx.debt.create({
      data: {
        debt_name,
        creditor_name,
        amount: amount.toString(),
        installments,
        monthly_payment: monthly_payment.toString(),
        due_date: new Date(due_date),
        contributors: {
          create: contributors.map((c, idx) => {
            const normalizedContributorName = normalizeName(c.name);

            return {
              contribution_amount: c.contribution_amount.toString(),
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
      OR: [
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
  return await prisma.debt.findUnique({
    where: { id: Number(id) },
    include: {
      contributors: {
        include: { contributor: true },
      },
    },
  });
}

// ✅ 5. CRUD - Actualizar deuda por ID (sin tocar contribuyentes todavía)
export async function updateDebtByIdService(id, payload) {
  const {
    debt_name,
    creditor_name,
    amount,
    installments,
    monthly_payment,
    due_date,
    contributors,
  } = payload;

  return await prisma.$transaction(async (tx) => {
    // ✅ A. Verificar existencia
    const existingDebt = await tx.debt.findUnique({
      where: { id: Number(id) },
      include: { contributors: true },
    });

    if (!existingDebt) throw new Error("Debt not found");

    // ✅ B. Preparar valores actuales
    const currentMonthlyPayment = monthly_payment
      ? parseFloat(monthly_payment)
      : parseFloat(existingDebt.monthly_payment);

    // ✅ C. Si vienen contribuyentes, validar suma
    if (contributors && Array.isArray(contributors)) {
      const totalContribution = contributors.reduce(
        (sum, c) => sum + parseFloat(c.contribution_amount),
        0
      );

      if (Math.abs(totalContribution - currentMonthlyPayment) > 0.01) {
        throw new Error(
          `Total contributions (${totalContribution.toFixed(
            2
          )}) do not match monthly_payment (${currentMonthlyPayment.toFixed(2)})`
        );
      }
    }

    // ✅ D. Actualizamos contribuyentes solo si vienen en payload
    if (contributors && Array.isArray(contributors)) {
      // Eliminar los actuales
      await tx.debtContributor.deleteMany({
        where: { debtId: Number(id) },
      });

      // Recrear
      for (let i = 0; i < contributors.length; i++) {
        const c = contributors[i];

        // Normaliza nombre para coincidencias sin tildes
        const normalizedName = c.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

        let contributorRecord = await tx.contributor.findFirst({
          where: {
            name: {
              equals: normalizedName,
              mode: "insensitive",
            },
          },
        });

        if (!contributorRecord) {
          contributorRecord = await tx.contributor.create({
            data: { name: c.name.trim() },
          });
        }

        await tx.debtContributor.create({
          data: {
            debtId: Number(id),
            contributorId: contributorRecord.id,
            contribution_amount: c.contribution_amount.toString(),
            is_primary: i === 0,
          },
        });
      }
    }

    // ✅ E. Finalmente actualizamos los datos generales de la deuda
    const updatedDebt = await tx.debt.update({
      where: { id: Number(id) },
      data: {
        ...(debt_name && { debt_name }),
        ...(creditor_name && { creditor_name }),
        ...(amount && { amount: amount.toString() }),
        ...(installments && { installments }),
        ...(monthly_payment && {
          monthly_payment: monthly_payment.toString(),
        }),
        ...(due_date && { due_date: new Date(due_date) }),
      },
      include: {
        contributors: {
          include: { contributor: true },
        },
      },
    });

    return updatedDebt;
  });
}

// ✅ 6. CRUD -Eliminar deuda por ID
export async function deleteDebt(id, force = false) {
  const debtId = Number(id);

  // ✅ Verificar si existe
  const existing = await prisma.debt.findUnique({
    where: { id: debtId },
    include: { contributors: true }
  });

  if (!existing) {
    throw new Error("Debt not found");
  }

  // ✅ Hard delete (force = true)
  if (force) {
    // Eliminar relaciones
    await prisma.debtContributor.deleteMany({
      where: { debtId }
    });

    // Eliminar deuda
    await prisma.debt.delete({
      where: { id: debtId }
    });

    return { message: "Debt permanently deleted" };
  }

  // ✅ Soft delete (por defecto)
  const now = new Date();
  await prisma.debt.update({
    where: { id: debtId },
    data: {
      is_deleted: true,
      deletedAt: now
    }
  });

  return { message: "Debt soft deleted", deletedAt: now };
}

// ✅ Restaurar (undelete) deuda
export async function restoreDebt(id) {
  const debtId = Number(id);

  // Verificar existencia
  const existing = await prisma.debt.findUnique({
    where: { id: debtId },
  });

  if (!existing) {
    throw new Error("Debt not found");
  }

  // Verificar que esté eliminada
  if (!existing.is_deleted && existing.deletedAt === null) {
    throw new Error("Debt is not deleted");
  }

  // Restaurar
  const restored = await prisma.debt.update({
    where: { id: debtId },
    data: {
      is_deleted: false,
      deletedAt: null,
    },
  });

  return { message: "Debt restored successfully", data: restored };
}

// Servicio adicional para obtener solo deudas activas (no eliminadas)
// ✅ Obtener deudas activas (is_deleted = false)
export async function getActiveDebtsService() {
  return await prisma.debt.findMany({
    where: {
      OR: [
        { is_deleted: false },
        { deletedAt: null }
      ]
    },
    include: {
      contributors: {
        include: {
          contributor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}


// Servicio adicional para obtener deudas por contribuyente
export async function getDebtsByContributorService(contributorId) {
  return await prisma.debt.findMany({
    where: {
      contributors: {
        some: {
          contributorId: Number(contributorId),
        },
      },
      is_deleted: false,
    },
    include: {
      contributors: {
        where: {
          contributorId: Number(contributorId),
        },
        select: {
          contribution_amount: true,
          is_primary: true,
          contributor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Servicio adicional para reporte de contribuciones totales por contribuyente
export async function getContributionsReportService() {
  const grouped = await prisma.debtContributor.groupBy({
    by: ["contributorId"],
    _sum: {
      contribution_amount: true,
    },
    _count: {
      debtId: true,
    },
  });

  const results = await Promise.all(
    grouped.map(async (item) => {
      const contributor = await prisma.contributor.findUnique({
        where: { id: item.contributorId },
        select: { name: true },
      });

      return {
        contributorId: item.contributorId,
        contributorName: contributor?.name,
        totalContribution: item._sum.contribution_amount,
        numberOfDebts: item._count.debtId,
      };
    })
  );

  return results;
}
