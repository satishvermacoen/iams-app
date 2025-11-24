// src/app/api/course-offerings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import CourseOffering from "@/models/CourseOffering";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "STUDENT",
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get("semesterId");
    const programId = searchParams.get("programId");
    const search = searchParams.get("search") || "";

    const query = {};

    if (semesterId) {
      query.semester = semesterId;
    }

    if (programId) {
      query.program = programId;
    }

    // We'll handle search client-side on course name/code for simplicity.

    const items = await CourseOffering.find(query)
      .populate("course")
      .populate("semester")
      .populate({ path: "faculty", populate: { path: "user" } })
      .populate("program")
      .lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/course-offerings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
