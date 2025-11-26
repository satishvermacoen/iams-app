import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Student from "@/models/Student";

// DELETE /api/enrollments/[id]
// Drop a course
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { id } = params;
    const student = await Student.findOne({ user: user.userId });
    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    const enrollment = await Enrollment.findOne({ _id: id, student: student._id });
    if (!enrollment) {
      return NextResponse.json({ message: "Enrollment not found" }, { status: 404 });
    }

    await Enrollment.findByIdAndDelete(id);

    return NextResponse.json({ message: "Course dropped successfully" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/enrollments/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
