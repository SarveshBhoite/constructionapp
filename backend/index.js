const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const prisma = require("./src/lib/prisma");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Detailed Health Check for Debugging
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "ok", 
      database: "connected", 
      timestamp: new Date(),
      env: {
        has_db_url: !!process.env.DATABASE_URL
      }
    });
  } catch (error) {
    console.error("DATABASE CONNECTION ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Import Routes
const workerRoutes = require("./src/routes/worker.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");

app.use("/api/workers", workerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Catch-all for 404s to help debugging
app.use((req, res, next) => {
  console.log(`404 Check - Path: ${req.path} | Original: ${req.originalUrl}`);
  res.status(404).json({ error: `Path ${req.originalUrl} not found` });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Keep-alive to prevent premature exit with Prisma 7 Driver Adapters
setInterval(() => {}, 1000 * 60 * 60);

// Global Error Handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});
