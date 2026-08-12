import "dotenv/config";
import express from "express";
import connectDB from "./DB/Mongo.js";
import cors from "cors";
import signupRoutes from "./routes/signupRoutes.js";
import signinRoutes from "./routes/signinRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const app = express();

connectDB();
app.use(cors());


app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the student intelligence portal");
});

app.use("/api/auth", signupRoutes);
app.use("/api/auth", signinRoutes);
app.use("/api/students", studentRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});