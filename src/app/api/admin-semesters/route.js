// src/app/api/admin-semesters/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Semester from "@/models/Semester";

export async function GET(req) {
  try {
    await connectDB();
    const { error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const items = await Semester.find().sort({ order: 1 }).lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin-semesters error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
