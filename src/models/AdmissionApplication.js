// src/models/AdmissionApplication.js
import mongoose from "mongoose";

const admissionApplicationSchema = new mongoose.Schema(
  {
    applicantName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    appliedAt: { type: Date, default: Date.now },
    decisionAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.AdmissionApplication ||
  mongoose.model("AdmissionApplication", admissionApplicationSchema);
