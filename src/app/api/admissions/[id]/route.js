// src/app/api/admissions/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmissionApplication from "@/models/AdmissionApplication";
import { requireRole } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { status } = body; // "APPROVED" | "REJECTED"

    const { user, error, status: authStatus } = await requireRole(req, [
      "ADMIN",
      "ADMISSION_OFFICER",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const app = await AdmissionApplication.findById(id);
    if (!app) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    app.status = status;
    app.decisionAt = new Date();
    await app.save();

    return NextResponse.json({ item: app }, { status: 200 });
  } catch (err) {
    console.error("Admissions update error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
