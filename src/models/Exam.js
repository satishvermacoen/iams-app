// src/models/Exam.js
import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    offering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOffering",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["INTERNAL", "MIDTERM", "FINAL", "QUIZ", "PRACTICAL", "OTHER"],
      default: "INTERNAL",
    },
    examDate: {
      type: Date,
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
    },
    weightage: {
      type: Number, // e.g. 20 for 20% of total grade
    },
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
