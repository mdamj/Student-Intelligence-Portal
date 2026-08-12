import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    Student_ID: {
      type: String,
      required: true,
      unique: true
    },

    Student_Name: {
      type: String,
      required: true
    },

    Batch: String,

    Course: String,

    City: String,

    Education: String,

    Experience: String,

    Skill_Score: Number,

    Communication_Score: Number,

    Mock_Average: Number,

    Interview_Average: Number,

    Projects_Completed: Number,

    Applications_Count: Number,

    "Profile_Completion_%": Number,

    Placement_Readiness_Score: Number,

    Placement_Status: String,

    Placed_Salary_LPA: Number,

    "Average Assessment Score": Number,

    "Readiness Lvel": String
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;