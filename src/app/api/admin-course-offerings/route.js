// src/app/api/admin-course-offerings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import CourseOffering from "@/models/CourseOffering";
import Course from "@/models/Course";
import Program from "@/models/Program";
import Semester from "@/models/Semester";
import Faculty from "@/models/Faculty";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get("programId");
    const semesterId = searchParams.get("semesterId");
    const search = searchParams.get("search") || "";

    const query = {};
    if (programId) query.program = programId;
    if (semesterId) query.semester = semesterId;

    const items = await CourseOffering.find(query)
      .populate("course")
      .populate("program")
      .populate("semester")
      .populate({ path: "faculty", populate: { path: "user" } })
      .lean();

    let filtered = items;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = items.filter((off) => {
        const code = off.course?.courseCode?.toLowerCase() || "";
        const name = off.course?.courseName?.toLowerCase() || "";
        const section = off.section?.toLowerCase() || "";
        return code.includes(s) || name.includes(s) || section.includes(s);
      });
    }

    return NextResponse.json({ items: filtered }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin-course-offerings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const {
      programId,
      semesterId,
      courseId,
      facultyId,
      section,
      scheduleText,
    } = body;

    if (!courseId || !semesterId || !facultyId) {
      return NextResponse.json(
        { message: "courseId, semesterId and facultyId are required" },
        { status: 400 }
      );
    }

    const courseExists = await Course.exists({ _id: courseId });
    if (!courseExists) {
      return NextResponse.json({ message: "Invalid courseId" }, { status: 400 });
    }

    const semesterExists = await Semester.exists({ _id: semesterId });
    if (!semesterExists) {
      return NextResponse.json(
        { message: "Invalid semesterId" },
        { status: 400 }
      );
    }

    if (programId) {
      const programExists = await Program.exists({ _id: programId });
      if (!programExists) {
        return NextResponse.json(
          { message: "Invalid programId" },
          { status: 400 }
        );
      }
    }

    const facultyExists = await Faculty.exists({ _id: facultyId });
    if (!facultyExists) {
      return NextResponse.json({ message: "Invalid facultyId" }, { status: 400 });
    }

    const offering = await CourseOffering.create({
      course: courseId,
      program: programId || null,
      semester: semesterId,
      faculty: facultyId,
      section: section || "",
      scheduleText: scheduleText || "",
    });

    const populated = await CourseOffering.findById(offering._id)
      .populate("course")
      .populate("program")
      .populate("semester")
      .populate({ path: "faculty", populate: { path: "user" } })
      .lean();

    return NextResponse.json({ item: populated }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin-course-offerings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
