// src/models/AttendanceSession.js
import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema(
  {
    offering: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseOffering",
      required: true,
    },
    sessionDate: { type: Date, required: true },
    startTime: { type: String }, // "09:00", you can adjust
    endTime: { type: String },
    mode: {
      type: String,
      enum: ["OFFLINE", "ONLINE"],
      default: "OFFLINE",
    },
  },
  { timestamps: true }
);

export default mongoose.models.AttendanceSession ||
  mongoose.model("AttendanceSession", attendanceSessionSchema);
