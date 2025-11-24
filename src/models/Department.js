// src/models/Department.js
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Department || mongoose.model("Department", departmentSchema);
