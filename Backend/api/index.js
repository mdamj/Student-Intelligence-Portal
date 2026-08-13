import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "../DB/Mongo.js";

import signinRoutes from "../routes/signinRoutes.js";
import signupRoutes from "../routes/signupRoutes.js";
import studentRoutes from "../routes/studentRoutes.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Intelligence Portal Backend is running"
  });
});

app.use("/api/auth", signinRoutes);
app.use("/api/auth", signupRoutes);
app.use("/api/students", studentRoutes);

export default app;