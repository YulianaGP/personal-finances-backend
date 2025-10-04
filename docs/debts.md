# ✅ PARTE 1 — Historias de Usuario (1 a 12)

## 🟦 Sección A: Creación y validaciones iniciales de la deuda

### **HU1 – Crear deuda bancaria con contribuyentes desde el inicio**
**Como** usuario  
**Quiero** registrar una deuda con toda su información básica y los contribuyentes asignados desde el inicio  
**Para** tener control total desde el primer momento

**Datos obligatorios:**
- `debt_name` (debe ser único)
- `creditor_name`
- `amount` (total de la deuda)
- `installments` (número de cuotas)
- `due_date` (fecha límite de la última cuota)
- `contributors[]` (mínimo 1):
  - `name`
  - `contribution_amount`

**Criterios de aceptación:**
- ❌ No se permite deuda sin contribuyentes  
- ✅ Debe existir al menos 1 contribuyente con su monto  
- ✅ La suma de los aportes de los contribuyentes debe ser igual al `monthly_payment` estimado o proporcional  
- ❌ No se permite `debt_name` duplicado

---

### **HU2 – Calcular el interés automáticamente**
**Como** usuario  
**Quiero** que el backend calcule el interés cuando ingreso `amount`, `installments` y `monthly_payment`  
**Para** no tener que calcularlo manualmente

**Criterios de aceptación:**
- ✅ Si no se envía `interest_rate`, el sistema lo calcula automáticamente  
- ✅ Si no se envía `monthly_payment`, se calcula con interés 0 por defecto  
- ✅ Fórmula documentada como funcionalidad futura

---

### **HU3 – Validar unicidad de `debt_name`**
**Como** usuario  
**Quiero** que el sistema impida registrar dos deudas con el mismo nombre  
**Para** evitar confusión y duplicados

**Criterios de aceptación:**
- ❌ Si `debt_name` ya existe → se rechaza el registro  
- ✅ La validación ocurre antes de guardar

---

### **HU4 – Crear contribuyentes automáticamente si no existen**
**Como** usuario  
**Quiero** que si un contribuyente no existe, se cree automáticamente durante el registro de la deuda  
**Para** no tener que registrarlo antes

**Criterios de aceptación:**
- ✅ Si el nombre no existe → se crea un nuevo contribuyente  
- ✅ Se asigna `id` automáticamente  
- ✅ Se guarda su `contribution_amount` asociado a la deuda

---

## 🟦 Sección B: Cronograma de pagos inicial

### **HU5 – Generar cronograma automáticamente**
**Como** usuario  
**Quiero** que el sistema genere un cronograma para todas las cuotas  
**Para** saber fechas y estados de pago

**Cada cuota debe incluir:**
- `installment_number` (1, 2, 3, …)  
- `due_date` individual  
- `amount`  
- `isPaid = false` por defecto

---

### **HU6 – Marcar cuotas como pagadas**
**Como** usuario  
**Quiero** poder registrar que una cuota ya fue cancelada  
**Para** llevar el control real

**Criterios de aceptación:**
- ✅ Al marcar una cuota → `isPaid = true`  
- ✅ No se modifican otras cuotas

---

### **HU7 – Mostrar porcentaje de avance**
**Como** usuario  
**Quiero** ver el avance de pago total en porcentaje entero  
**Para** saber cuánto llevo pagado

**Ejemplo:**  
Si 1 de 36 cuotas está pagada → `3%`

---

### **HU8 – Ver listado general de deudas**
**Como** usuario  
**Quiero** ver todas las deudas registradas  
**Para** tener una vista general

**Cada deuda debe mostrar:**
- `debt_name`  
- `creditor_name`  
- `amount`  
- `installments`  
- `due_date`  
- `paid_installments/total`  
- `porcentaje_pagado`

---

### **HU9 – Ver detalle de una deuda por ID**
**Como** usuario  
**Quiero** consultar una deuda por su `id`  
**Para** ver todo lo relacionado

**Debe incluir:**
- Datos generales  
- Lista de contribuyentes con montos  
- Cronograma completo  
- Porcentaje de avance  
- Cuotas pendientes vs pagadas

---

### **HU10 – Listar todas las cuotas de una deuda**
**Como** usuario  
**Quiero** ver todas las cuotas una por una  
**Para** seguir el orden de pagos

**Cada cuota contiene:**
- `installment_number`  
- `fecha`  
- `amount`  
- `isPaid`

---

### **HU11 – Mostrar próximos vencimientos**
**Como** usuario  
**Quiero** ver las próximas cuotas a vencer  
**Para** anticiparme

**Criterios de aceptación:**
- ✅ Permitir filtrar por días o fechas

---

### **HU12 – Obtener resumen general**
**Como** usuario  
**Quiero** ver un resumen rápido de mis deudas  
**Para** tener información clave en el dashboard

**Incluye:**
- Total de deudas activas  
- Total pagado  
- Total pendiente  
- % de avance global

# ✅ PARTE 2 — Historias de Usuario (13 a 22)

## 🟦 Sección C: Edición, actualización y ajustes de la deuda

### **HU13 – Editar datos generales de una deuda**
**Como** usuario  
**Quiero** poder modificar algunos datos de una deuda existente  
**Para** corregir información o actualizarla

**Campos editables:**
- `creditor_name`
- `due_date`
- `monthly_payment` (esto puede provocar recálculo de interés)
- `installments` (solo si se ajusta el plan con banco)

**Criterios de aceptación:**
- ✅ No se puede editar a un nombre (`debt_name`) duplicado
- ✅ La deuda no debe estar eliminada (soft delete)

---

### **HU14 – Editar contribuyentes de una deuda**
**Como** usuario  
**Quiero** modificar el aporte de uno o más contribuyentes ya asignados  
**Para** actualizar su participación real

**Criterios de aceptación:**
- ✅ Se puede cambiar `contribution_amount`
- ✅ Se valida que sus nombres existan
- ✅ Si falta un contribuyente, se crea automáticamente

---

### **HU15 – Agregar un nuevo contribuyente a una deuda existente**
**Como** usuario  
**Quiero** añadir otro contribuyente después de creada la deuda  
**Para** dividir pagos o incluir a alguien nuevo

**Criterios de aceptación:**
- ✅ Validar que no esté repetido
- ✅ Crear si no existe
- ✅ Ajustar aportes sin romper la suma total

---

### **HU16 – Eliminar contribuyente de la deuda**
**Como** usuario  
**Quiero** quitar un contribuyente asociado  
**Para** actualizar la responsabilidad de pago

**Criterios de aceptación:**
- ✅ Debe quedar al menos 1 contribuyente
- ✅ No se puede eliminar si tiene pagos registrados

---

### **HU17 – Registrar un pago de cuota (método tradicional)**
**Como** usuario  
**Quiero** marcar una cuota como pagada manualmente  
**Para** reflejar el avance real

**Criterios de aceptación:**
- ✅ Se cambia `isPaid = true` solo en esa cuota
- ✅ No recalcula el cronograma

---

### **HU18 – Registrar un pago a saldo a capital (ajuste del cronograma)**  
**Como** usuario  
**Quiero** registrar un pago extra que reduzca saldo y reorganice cuotas  
**Para** reflejar el nuevo cronograma entregado por el banco

**Criterios de aceptación:**
- ✅ Se reduce el `amount` pendiente
- ✅ Se recalcula `installments` o fechas futuras
- ✅ Las cuotas ya pagadas no se alteran
- ✅ Se debe poder almacenar ajustes futuros

---

### **HU19 – Actualizar cronograma tras saldo a capital**
**Como** usuario  
**Quiero** que el sistema genere un nuevo cronograma con base al saldo  
**Para** coincidir con el nuevo plan del banco

**Criterios:**
- ✅ Nuevas fechas y montos reflejados
- ✅ Se mantiene historial anterior
- ✅ `installments` puede cambiar

---

### **HU20 – Recalcular el interés si cambia la mensualidad**
**Como** usuario  
**Quiero** que el sistema ajuste el interés después de un pago que modifica las cuotas  
**Para** que los datos estén alineados con lo que dice el banco

**Criterios:**
- ✅ Interés recalculado automáticamente
- ✅ No se sobrescribe el cálculo anterior
- ✅ Registro histórico de cambios

---

## 🟦 Sección D: Eliminaciones, restauraciones y control de estado

### **HU21 – Eliminar deuda (soft delete)**
**Como** usuario  
**Quiero** eliminar una deuda sin borrarla permanentemente  
**Para** evitar errores o pérdidas irreversibles

**Criterios de aceptación:**
- ✅ Se marca como `deleted = true`
- ✅ No desaparece de la base de datos
- ✅ Oculta en listados principales

---

### **HU22 – Restaurar deuda eliminada**
**Como** usuario  
**Quiero** recuperar una deuda eliminada previamente  
**Para** continuar su seguimiento

**Criterios de aceptación:**
- ✅ Se cambia a `deleted = false`
- ✅ La deuda debe existir en base de datos


# ✅ PARTE 3 — Historias de Usuario (HU23 a HU32)

## 🟦 Sección E: Reportes, filtrado y consultas avanzadas

### **HU23 – Ver porcentaje de cuotas pagadas**
**Como** usuario  
**Quiero** ver el avance de cada deuda en porcentaje entero  
**Para** saber qué tanto falta pagar

**Criterios de aceptación:**
- ✅ Fórmula: `(cuotas_pagadas / total_cuotas) * 100`
- ✅ Redondeo entero (sin decimales)
- ✅ Ejemplo: 1/36 → 3%

---

### **HU24 – Filtrar deudas por contribuyente**
**Como** usuario  
**Quiero** ver todas las deudas donde participa un contribuyente específico  
**Para** consultar sus obligaciones individuales

**Criterios de aceptación:**
- ✅ Se busca por `contributor_id` o `name`
- ✅ Debe mostrar:
  - Total de deudas
  - Monto por deuda
  - Cuánto paga ese contribuyente

---

### **HU25 – Ver detalle completo de deuda por ID**
**Como** usuario  
**Quiero** consultar una deuda específica  
**Para** revisar toda su información

**Debe incluir:**
- Nombre y acreedor
- Monto total y cuotas
- Contribuyentes y aportes
- Porcentaje de avance
- Cronograma completo

---

### **HU26 – Generar cronograma de pagos al crear deuda**
**Como** usuario  
**Quiero** que automáticamente se genere el calendario de cuotas  
**Para** ver fechas y montos desde el inicio

**Criterios:**
- ✅ Cantidad de cuotas = `installments`
- ✅ Fecha inicial = mes siguiente
- ✅ Cada cuota:
  - `id`, `amount`, `due_date`, `isPaid = false`

---

### **HU27 – Modificar cronograma tras saldo a capital**
**Como** usuario  
**Quiero** que después de un pago extra se reestructuren futuras cuotas  
**Para** reflejar lo que indica el banco

**Criterios:**
- ✅ Las cuotas pagadas no cambian
- ✅ Se recalculan solo las pendientes
- ✅ Puede reducir el número de cuotas o el valor

---

### **HU28 – Consultar pagos de un contribuyente**
**Como** usuario  
**Quiero** ver el historial de pagos de una persona  
**Para** saber qué ha aportado y qué falta

**Debe incluir:**
- Deudas vinculadas
- Monto total pagado
- Cuotas pendientes
- Aportes por cuota

---

### **HU29 – Marcar cuota como pagada (idempotencia)**
**Como** usuario  
**Quiero** evitar marcar dos veces la misma cuota como pagada  
**Para** mantener datos consistentes

**Criterios:**
- ✅ Si ya está `isPaid = true`, no se vuelve a registrar
- ✅ No se duplica en reportes ni totales

---

## 🟦 Sección F: Exportación, seguridad y configuraciones complementarias

### **HU30 – Exportar deuda a Excel**
**Como** usuario  
**Quiero** descargar el detalle de una deuda en archivo Excel  
**Para** analizarla o compartirla

**Debe incluir:**
- Cronograma
- Contribuyentes
- Estado de pagos
- Avance en porcentaje

---

### **HU31 – Roles y permisos**
**Como** administrador (futuro)  
**Quiero** que solo ciertos usuarios editen o eliminen  
**Para** proteger los datos

**Roles previstos:**
- Admin
- Lector
- Usuario limitado

---

### **HU32 – Recordatorios de cuotas próximas**
**Como** usuario  
**Quiero** recibir alertas antes del vencimiento  
**Para** no retrasarme en los pagos

**Criterios:**
- ✅ Notificación X días antes
- ✅ Posible envío por email o app
- ✅ Activable/desactivable por deuda
