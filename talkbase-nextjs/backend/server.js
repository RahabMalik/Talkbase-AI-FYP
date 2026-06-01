const express   = require("express");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./lib/mongodb");
const app = express();

/* ── CORS — locked to allowed origins only ───────────────────────────────── 
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",").map(o => o.trim()); */

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,x-api-key");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

app.use(express.json({ limit: "1mb" }));

/* ── Rate limiting ───────────────────────────────────────────────────────── */

// Auth routes — 200 attempts per 15 min per IP
// (multitenant: many business owners + shared office IPs)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API — 500 requests per minute per IP
// (dashboards poll analytics, FAQ lists, settings — all count here)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  message: { message: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Widget chat — 200 requests per minute per IP
// (many visitors from the same business website share one IP)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: { message: "Too many chat requests. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── DB ──────────────────────────────────────────────────────────────────── */
connectDB();

/* ── Routes with rate limiting ───────────────────────────────────────────── */
app.use("/api/auth",      authLimiter, require("./routes/auth"));
app.use("/api/ai/chat",   chatLimiter);
app.use("/api/faq",       apiLimiter,  require("./routes/faq"));
app.use("/api/ai",        apiLimiter,  require("./routes/ai"));
app.use("/api/business",  apiLimiter,  require("./routes/business"));
app.use("/api/analytics", apiLimiter,  require("./routes/analytics"));

/* ── Health check ────────────────────────────────────────────────────────── */
app.get("/", (req, res) => res.send("Backend is running 🚀"));

/* ── Global error handler ────────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error("[UNHANDLED ERROR]", err.message);
  res.status(500).json({ message: "Internal server error" });
});

/* ── Start ───────────────────────────────────────────────────────────────── */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
