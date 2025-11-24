// src/models/ExamResult.js
import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    marksObtained: { type: Number, required: true },
    grade: { type: String }, // optional; can calculate later
    resultPublishedAt: { type: Date },
  },
  { timestamps: true }
);

examResultSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.models.ExamResult ||
  mongoose.model("ExamResult", examResultSchema);
