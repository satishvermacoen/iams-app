// src/app/api/admissions/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import AdmissionApplication from "@/models/AdmissionApplication";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { id } = await params;
    const app = await AdmissionApplication.findById(id)
      .populate("program")
      .lean();

    if (!app) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ item: app }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admissions/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// If you already have PATCH here, keep it or merge logic; shown for completeness
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { status: newStatus } = body;

    const { id } = await params;
    const app = await AdmissionApplication.findById(id);
    if (!app) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    if (newStatus) {
      app.status = newStatus;
      if (["APPROVED", "REJECTED"].includes(newStatus) && !app.decisionAt) {
        app.decisionAt = new Date();
      }
    }

    await app.save();

    return NextResponse.json({ item: app }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/admissions/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
