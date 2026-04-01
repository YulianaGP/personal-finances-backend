// src/app.js
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import debtRoutes from "./routes/debtRoutes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerDoc = load(readFileSync(join(__dirname, "../docs/openapi.yaml"), "utf8"));

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
  customSiteTitle: "Personal Finances API",
}));

// Routes
app.use("/api/debts", debtRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "🎉 Personal Finances API is running!",
    docs: "/docs",
  });
});

export default app;
