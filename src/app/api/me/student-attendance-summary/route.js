// src/app/api/me/student-attendance-summary/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";

import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";
import AttendanceRecord from "@/models/AttendanceRecord";
import AttendanceSession from "@/models/AttendanceSession";

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

    const enrollments = await Enrollment.find({
      student: student._id,
      status: { $ne: "DROPPED" },
    })
      .populate({
        path: "offering",
        populate: { path: "course" },
      })
      .lean();

    const enrollmentIds = enrollments.map((e) => e._id);
    if (enrollmentIds.length === 0) {
      return NextResponse.json(
        { student, courses: [] },
        { status: 200 }
      );
    }

    const attendanceRecords = await AttendanceRecord.find({
      enrollment: { $in: enrollmentIds },
    })
      .populate({
        path: "session",
        select: "offering",
        populate: {
          path: "offering",
          select: "course",
          populate: { path: "course" },
        },
      })
      .select("enrollment status")
      .lean();

    const statsByEnrollment = new Map(); // key: enrollmentId, val: { presentCount, totalCount }

    for (const rec of attendanceRecords) {
      const eid = String(rec.enrollment);
      if (!statsByEnrollment.has(eid)) {
        statsByEnrollment.set(eid, { presentCount: 0, totalCount: 0 });
      }
      const bucket = statsByEnrollment.get(eid);
      bucket.totalCount += 1;
      if (rec.status === "PRESENT") bucket.presentCount += 1;
    }

    const courses = enrollments.map((en) => {
      const eid = String(en._id);
      const off = en.offering || {};
      const course = off.course || {};
      const stat = statsByEnrollment.get(eid) || {
        presentCount: 0,
        totalCount: 0,
      };

      const percentage =
        stat.totalCount > 0
          ? Math.round((stat.presentCount / stat.totalCount) * 100)
          : null;

      return {
        enrollmentId: en._id,
        course: {
          id: course._id,
          name: course.courseName,
          code: course.courseCode,
        },
        attendance: {
          presentCount: stat.presentCount,
          totalCount: stat.totalCount,
          percentage,
        },
      };
    });

    return NextResponse.json(
      { student, courses },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "GET /api/me/student-attendance-summary error:",
      err
    );
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
