// src/models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    admissionApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionApplication",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    currentSemester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    enrollmentNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    dateOfJoining: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["ACTIVE", "PASSED_OUT", "DROPPED"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", studentSchema);
