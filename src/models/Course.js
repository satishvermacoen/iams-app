// src/models/Course.js
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: false, // can be null if generic
    },
    courseCode: { type: String, required: true, trim: true, unique: true },
    courseName: { type: String, required: true, trim: true },
    credits: { type: Number, required: true },
    type: {
      type: String,
      enum: ["CORE", "ELECTIVE", "LAB"],
      default: "CORE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
