// src/models/Faculty.js
import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    designation: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);
