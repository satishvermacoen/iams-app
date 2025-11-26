// src/app/api/course-offerings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import CourseOffering from "@/models/CourseOffering";
import "@/models/Course";
import "@/models/Semester";
import "@/models/Faculty";
import "@/models/User";

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

    // TODO: Fix program filtering (Program is on Semester, not Offering)
    if (programId) {
      // query.program = programId; 
    }

    // We'll handle search client-side on course name/code for simplicity.

    const items = await CourseOffering.find(query)
      .populate("course")
      .populate("semester")
      .populate({ path: "faculty", populate: { path: "user" } })
      .lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/course-offerings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/course-offerings (Admin only)
export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { courseId, semesterId, facultyId, section, year, maxCapacity, schedule } = body;

    if (!courseId || !semesterId || !facultyId || !year) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const offering = await CourseOffering.create({
      course: courseId,
      semester: semesterId,
      faculty: facultyId,
      section: section || "A",
      year,
      maxCapacity: maxCapacity || 60,
      schedule: schedule || [],
    });

    return NextResponse.json({ item: offering }, { status: 201 });
  } catch (err) {
    console.error("POST /api/course-offerings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
