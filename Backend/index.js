import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./DB/Mongo.js";

import signinRoutes from "./routes/signinRoutes.js";
import signupRoutes from "./routes/signupRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Student Intelligence Portal");
});

app.use("/api/auth", signinRoutes);
app.use("/api/auth", signupRoutes);

app.use("/api/students", studentRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});