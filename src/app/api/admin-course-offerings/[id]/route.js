// src/app/api/admin-course-offerings/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import CourseOffering from "@/models/CourseOffering";
import Course from "@/models/Course";
import Program from "@/models/Program";
import Semester from "@/models/Semester";
import Faculty from "@/models/Faculty";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { id } = await params;
    const offering = await CourseOffering.findById(id)
      .populate("course")
      .populate("program")
      .populate("semester")
      .populate({ path: "faculty", populate: { path: "user" } })
      .lean();

    if (!offering) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ item: offering }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin-course-offerings/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
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

    const { id } = await params;
    const offering = await CourseOffering.findById(id);
    if (!offering) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (courseId !== undefined) {
      if (courseId) {
        const exists = await Course.exists({ _id: courseId });
        if (!exists) {
          return NextResponse.json(
            { message: "Invalid courseId" },
            { status: 400 }
          );
        }
        offering.course = courseId;
      }
    }

    if (programId !== undefined) {
      if (programId) {
        const exists = await Program.exists({ _id: programId });
        if (!exists) {
          return NextResponse.json(
            { message: "Invalid programId" },
            { status: 400 }
          );
        }
        offering.program = programId;
      } else {
        offering.program = null;
      }
    }

    if (semesterId !== undefined) {
      if (semesterId) {
        const exists = await Semester.exists({ _id: semesterId });
        if (!exists) {
          return NextResponse.json(
            { message: "Invalid semesterId" },
            { status: 400 }
          );
        }
        offering.semester = semesterId;
      }
    }

    if (facultyId !== undefined) {
      if (facultyId) {
        const exists = await Faculty.exists({ _id: facultyId });
        if (!exists) {
          return NextResponse.json(
            { message: "Invalid facultyId" },
            { status: 400 }
          );
        }
        offering.faculty = facultyId;
      }
    }

    if (section !== undefined) {
      offering.section = section || "";
    }

    if (scheduleText !== undefined) {
      offering.scheduleText = scheduleText || "";
    }

    await offering.save();

    const populated = await CourseOffering.findById(offering._id)
      .populate("course")
      .populate("program")
      .populate("semester")
      .populate({ path: "faculty", populate: { path: "user" } })
      .lean();

    return NextResponse.json({ item: populated }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/admin-course-offerings/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { id } = await params;
    const offering = await CourseOffering.findByIdAndDelete(id);
    if (!offering) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/admin-course-offerings/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
