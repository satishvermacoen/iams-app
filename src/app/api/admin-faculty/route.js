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
