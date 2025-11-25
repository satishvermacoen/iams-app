// src/models/ExamResult.js
import mongoose from "mongoose";

const ExamResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    marks: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT"],
      default: "PRESENT",
    },
  },
  { timestamps: true }
);

ExamResultSchema.index({ exam: 1, enrollment: 1 }, { unique: true });

export default mongoose.models.ExamResult ||
  mongoose.model("ExamResult", ExamResultSchema);
