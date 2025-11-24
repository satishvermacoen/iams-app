// src/models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // some actions may be system
    },
    action: { type: String, required: true }, // "LOGIN", "CREATE_ADMISSION", etc.
    entityType: { type: String, required: true }, // "STUDENT", "COURSE", ...
    entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
    metadata: { type: mongoose.Schema.Types.Mixed }, // additional info
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
