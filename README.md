# 🏦 Personal Finances Backend

Este proyecto corresponde al **backend** de la aplicación *Personal Finances*.  
Se usa el sistema **ECMAScript Modules (ESM)**
Está desarrollado con **Node.js**, **Express** y **Prisma ORM**, usando **PostgreSQL (Neon en la nube)** como base de datos.

---

## 🚀 Tecnologías y piezas clave

Estas son las piezas que **sí o sí** forman parte de este backend:

- **Node.js + JavaScript (ESM)** → lenguaje y runtime.
- **Express** → framework HTTP para manejar rutas y middlewares.
- **Prisma ORM** → ORM moderno para definir modelos, migraciones y consultas a la DB.
- **@prisma/client** → cliente generado automáticamente por Prisma (se usa en el código para consultas).
- **Neon (PostgreSQL en la nube)** → base de datos principal del proyecto.
- **.env** → variables de entorno (DATABASE_URL, JWT_SECRET, PORT, CLIENT_URL, etc.).
- **config/db.js** → conexión centralizada a la DB (instancia de `PrismaClient`).
- **prisma/schema.prisma** → definición de los modelos/tablas (fuente de verdad).
- **migrations** → historial de migraciones de la DB (generadas por Prisma).
- **prisma/seed.js** → script opcional para poblar datos iniciales.
- **app.js** → configura Express (middlewares, rutas) y exporta la app.
- **server.js** → arranca el servidor (`app.listen`).
- **routes/** → define endpoints por recurso (ej: debts, hotel, rental, dashboard).
- **controllers/** → manejan `req`/`res` y delegan lógica a los servicios.
- **services/** → lógica de negocio y acceso a datos mediante Prisma.
- **middlewares/** → autenticación, validación, manejo de errores, logger, etc.
- **utils/** → funciones auxiliares (ej: formateo de datos, emails).
- **tests/** → pruebas unitarias e integración (Jest + Supertest).
- **logger** (opcional) → librerías como `pino` o `winston` para logging.
- **ESLint + Prettier + husky** (opcional) → linting, formateo y control de calidad.
- **Dockerfile / docker-compose** (opcional) → contenedores para despliegue.
- **.env.example** → ejemplo de variables de entorno.
- **README.md** → documentación del proyecto.

---

## 📂 Estructura de carpetas

La estructura recomendada del proyecto es:

```bash
personal-finances-backend/
│
├── prisma/
│   ├── schema.prisma         # Modelos de la base de datos (fuente de verdad)
│   └── seed.js               # Script opcional para poblar datos iniciales
│
├── src/
│   ├── config/
│   │   └── db.js             # Conexión centralizada con PrismaClient
│   │
│   ├── controllers/          # Controladores (req/res)
│   │   ├── debtController.js
│   │   ├── hotelController.js
│   │   ├── rentalController.js
│   │   └── dashboardController.js
│   │
│   ├── services/             # Lógica de negocio / acceso a datos
│   │   ├── debtService.js
│   │   ├── hotelService.js
│   │   ├── rentalService.js
│   │   └── dashboardService.js
│   │
│   ├── routes/               # Definición de rutas
│   │   ├── debtRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── rentalRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── middlewares/          # Middlewares (auth, validación, errores)
│   │   ├── auth.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   │
│   ├── utils/                # Helpers y utilidades
│   │   ├── email.js
│   │   └── formatters.js
│   │
│   ├── tests/                # Pruebas (unitarias / integración)
│   │
│   ├── app.js                # Configuración principal de Express
│   └── server.js             # Arranque del servidor
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── Dockerfile

## 🔄 Flujo de arquitectura

```mermaid
flowchart TD
    A[Cliente / Frontend] -->|HTTP Request| B[Routes]
    B --> C[Controllers]
    C --> D[Services]
    D --> E[Prisma Client]
    E --> F[(PostgreSQL - Neon)]
    
    F -->|Respuesta de datos| E
    E --> D
    D --> C
    C --> B
    B -->|HTTP Response (JSON)| A


Esto representa de forma visual:  

- El **frontend** hace la petición HTTP.  
- La petición entra por las **routes**.  
- Las **controllers** manejan `req/res`.  
- Las **services** procesan la lógica y llaman al **Prisma Client**.  
- **Prisma** se comunica con **Postgres (Neon)**.  
- La respuesta regresa en orden inverso hasta el frontend.  
