// src/app/api/admissions/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdmissionApplication from "@/models/AdmissionApplication";
import Program from "@/models/Program";
import { requireRole } from "@/lib/auth";

// GET /api/admissions?status=PENDING
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const { user, error, status: authStatus } = await requireRole(req, [
      "ADMIN",
      "ADMISSION_OFFICER",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    const query = {};
    if (status) query.status = status;

    const items = await AdmissionApplication.find(query)
      .populate("program")
      .sort({ appliedAt: -1 })
      .lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Admissions list error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/admissions
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { applicantName, email, phone, programId } = body;

    if (!applicantName || !email || !phone || !programId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const programExists = await Program.exists({ _id: programId });
    if (!programExists) {
      return NextResponse.json({ message: "Invalid programId" }, { status: 400 });
    }

    const app = await AdmissionApplication.create({
      applicantName,
      email,
      phone,
      program: programId,
    });

    return NextResponse.json({ item: app }, { status: 201 });
  } catch (err) {
    console.error("Admissions create error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
