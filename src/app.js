// src/app.js
import express from "express";
import cors from "cors";
import debtRoutes from "./routes/debtRoutes.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/debts", debtRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Personal Finances API is running!",
  });
});

export default app;
