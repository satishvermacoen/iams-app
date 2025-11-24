// src/models/Role.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["SUPER_ADMIN", "ADMIN", "FACULTY", "STUDENT", "EXAM_CELL", "ADMISSION_OFFICER"],
      unique: true,
    },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Role || mongoose.model("Role", roleSchema);
