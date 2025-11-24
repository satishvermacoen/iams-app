// src/models/Exam.js
import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    offering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOffering",
      required: true,
    },
    examType: {
      type: String,
      enum: ["MIDTERM", "ENDSEM", "QUIZ", "LAB"],
      required: true,
    },
    examDate: { type: Date, required: true },
    maxMarks: { type: Number, required: true },
    weightagePercent: { type: Number, required: true }, // part of final grade
  },
  { timestamps: true }
);

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);
