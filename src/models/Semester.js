// src/models/Semester.js
import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    name: { type: String, required: true }, // "Semester 1"
    sequenceNo: { type: Number, required: true }, // 1,2,3...
    academicYear: { type: String, required: true }, // "2025-2026"
  },
  { timestamps: true }
);

export default mongoose.models.Semester || mongoose.model("Semester", semesterSchema);
