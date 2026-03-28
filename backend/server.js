require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./utils/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS — allow frontend origin
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("CORS: origin not allowed"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true });
app.use("/api/", limiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/chat", require("./routes/chat"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`🚀 StudyMind backend → http://localhost:${PORT}`));
