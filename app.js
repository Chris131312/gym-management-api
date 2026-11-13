const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");
const { NotFoundError } = require("./utils/errors");

const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const membershipRoutes = require("./routes/membershipRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const auditRoutes = require("./routes/auditRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const isProduction = process.env.NODE_ENV === "production";

// FRONTEND_URL may hold several comma-separated origins; trailing slashes
// are dropped because browsers never send them in the Origin header.
const allowedOrigins = [
  ...(isProduction ? [] : ["http://localhost:5173"]),
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

const app = express();

// Behind a reverse proxy (Render, Railway, Vercel...) req.ip is the proxy's
// unless this is set; the login rate limiter depends on it.
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set("trust proxy", Number.isNaN(hops) ? process.env.TRUST_PROXY : hops);
} else if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Gym Management API is running smoothly.",
  });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/checkins", checkinRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/settings", settingsRoutes);

// 404 HANDLER
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// ERROR HANDLER
app.use(errorHandler);

module.exports = app;
