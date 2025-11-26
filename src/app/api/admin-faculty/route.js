// src/app/api/admin-faculty/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Faculty from "@/models/Faculty";

export async function GET(req) {
  try {
    await connectDB();
    const { error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const items = await Faculty.find()
      .populate("user")
      .populate("department")
      .lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin-faculty error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/admin-faculty
export async function POST(req) {
  try {
    await connectDB();
    const { error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { userId, departmentId, employeeCode, designation } = body;

    if (!userId || !departmentId || !employeeCode || !designation) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existing = await Faculty.findOne({ $or: [{ user: userId }, { employeeCode }] });
    if (existing) {
      return NextResponse.json({ message: "Faculty profile already exists" }, { status: 409 });
    }

    const faculty = await Faculty.create({
      user: userId,
      department: departmentId,
      employeeCode,
      designation,
    });

    return NextResponse.json({ item: faculty }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin-faculty error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
