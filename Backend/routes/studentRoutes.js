import express from "express";
import Student from "../Model/studentScheme.js";
import {
  requireAuth,
  requireRole
} from "../utils/auth.js";

const router = express.Router();

router.post(
  "/import",
  requireAuth,
  requireRole("admin", "trainer"),
  async (req, res) => {
    try {
      const students = req.body.students;

      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No student data received"
        });
      }

      const result = await Student.insertMany(students, {
        ordered: false
      });

      res.status(201).json({
        success: true,
        message: "Students imported successfully",
        count: result.length
      });
    } catch (error) {
      console.error("Import error:", error);

      res.status(500).json({
        success: false,
        message: "Error importing students"
      });
    }
  }
);

router.get("/", requireAuth, async (req, res) => {
  try {
    const students = await Student.find().lean();

    res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error("Fetch students error:", error);

    res.status(500).json({
      success: false,
      message: "Error fetching students"
    });
  }
});

export default router;
