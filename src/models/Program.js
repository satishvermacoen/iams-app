// src/models/Program.js
import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    durationYears: { type: Number, required: true }, // e.g., 3 or 4
  },
  { timestamps: true }
);

export default mongoose.models.Program || mongoose.model("Program", programSchema);
