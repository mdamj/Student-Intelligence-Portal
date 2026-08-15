import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./DB/Mongo.js";
import signinRoutes from "./routes/signinRoutes.js";
import signupRoutes from "./routes/signupRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "https://student-intelligence-portal.vercel.app"
];

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle preflight requests
app.options("*", cors());

// JSON parser
app.use(express.json({ limit: "2mb" }));

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Intelligence Portal Backend is running"
  });
});

// Routes
app.use("/api/auth", signinRoutes);
app.use("/api/auth", signupRoutes);
app.use("/api/students", studentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.message === "CORS origin not allowed") {
    return res.status(403).json({
      success: false,
      message: "CORS origin not allowed"
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;