import express from "express";
import Student from "../Model/studentScheme.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const {
      name,
      email,
      college,
      skills,
      assessmentScore,
      placementStatus
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const student = await Student.create({
      name,
      email,
      college,
      skills,
      assessmentScore,
      placementStatus
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      student
    });

  } catch (error) {
    console.error("Student error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

export default router;