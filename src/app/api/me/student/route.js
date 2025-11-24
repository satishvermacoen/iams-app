// src/app/api/me/student/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";
import Exam from "@/models/Exam";
import ExamResult from "@/models/ExamResult";
import AttendanceRecord from "@/models/AttendanceRecord";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const student = await Student.findOne({ user: user._id })
      .populate("program")
      .populate("currentSemester")
      .lean();

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const enrollments = await Enrollment.find({ student: student._id })
      .populate({
        path: "offering",
        populate: [{ path: "course" }, { path: "semester" }],
      })
      .lean();

    const offeringIds = enrollments.map((e) => e.offering?._id).filter(Boolean);

    const upcomingExams = await Exam.find({
      offering: { $in: offeringIds },
      examDate: { $gte: new Date() },
    })
      .sort({ examDate: 1 })
      .limit(5)
      .populate({
        path: "offering",
        populate: { path: "course" },
      })
      .lean();

    const attendanceRecords = await AttendanceRecord.find({
      student: student._id,
    }).lean();

    const totalSessions = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === "PRESENT"
    ).length;
    const overallAttendance =
      totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    return NextResponse.json(
      {
        student,
        enrollments,
        upcomingExams,
        attendanceSummary: {
          totalSessions,
          presentCount,
          overallAttendance,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me/student error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
