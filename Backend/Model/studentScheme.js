import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    college: {
      type: String,
      trim: true
    },

    skills: {
      type: [String],
      default: []
    },

    assessmentScore: {
      type: Number,
      default: 0
    },

    placementStatus: {
      type: String,
      default: "Preparing"
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model(
  "Student",
  studentSchema
);

export default Student;