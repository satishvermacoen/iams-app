// src/app/api/enrollments/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const enrollmentId = params.id;
    if (!enrollmentId) {
      return NextResponse.json(
        { message: "Enrollment id is required" },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: student._id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Soft drop – keep record
    enrollment.status = "DROPPED";
    await enrollment.save();

    return NextResponse.json(
      { message: "Enrollment dropped successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/enrollments/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
