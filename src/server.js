// src/server.js
import "dotenv/config";
import app from "./app.js";
import prisma from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏳ Shutting down gracefully...");
  await prisma.$disconnect();
  console.log("✅ Database disconnected");
  process.exit(0);
});

startServer();
