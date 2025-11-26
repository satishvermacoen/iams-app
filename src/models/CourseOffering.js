// src/models/CourseOffering.js
import mongoose from "mongoose";

const courseOfferingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    section: { type: String, default: "A" }, // A/B/C etc.
    year: { type: String, required: true }, // "2025-2026"
    maxCapacity: { type: Number, default: 60 },
    schedule: [
      {
        day: {
          type: String,
          enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
          required: true,
        },
        startTime: { type: String, required: true }, // HH:mm
        endTime: { type: String, required: true }, // HH:mm
        room: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.CourseOffering ||
  mongoose.model("CourseOffering", courseOfferingSchema);
