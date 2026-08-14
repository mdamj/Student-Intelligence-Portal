import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./DB/Mongo.js";
import signinRoutes from "./routes/signinRoutes.js";
import signupRoutes from "./routes/signupRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    }
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Intelligence Portal Backend is running"
  });
});

app.use("/api/auth", signinRoutes);
app.use("/api/auth", signupRoutes);
app.use("/api/students", studentRoutes);

app.use((err, req, res, next) => {
  console.error(err);

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
