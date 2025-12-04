// src/app.js
import express from "express";
import cors from "cors";
import debtRoutes from "./routes/debtRoutes.js";

const app = express();

// Middlewares
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/debts", debtRoutes);

// middleware global de errores (al final de todos los app.use / routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Body parser / JSON parse error
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(err);
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Personal Finances API is running!",
  });
});

export default app;
