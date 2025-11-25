// src/app/api/admin-analytics/overview/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";

import AdmissionApplication from "@/models/AdmissionApplication";
import Exam from "@/models/Exam";
import ExamResult from "@/models/ExamResult";
import AttendanceRecord from "@/models/AttendanceRecord";
import AttendanceSession from "@/models/AttendanceSession";

export async function GET(req) {
  try {
    await connectDB();
    const { error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    // 1) Admissions – last 6 months, grouped by month
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // include current month

    const admissionsRaw = await AdmissionApplication.find({
      appliedAt: { $gte: new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth(), 1) },
    })
      .select("status appliedAt")
      .lean();

    const monthMap = new Map(); // key: YYYY-MM, value: { total, approved, rejected, pending }

    function monthKey(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    }

    // Initialize 6 months buckets
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      monthMap.set(monthKey(d), {
        monthKey: monthKey(d),
        label: d.toLocaleString("default", { month: "short", year: "numeric" }),
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
      });
    }

    for (const app of admissionsRaw) {
      const d = app.appliedAt ? new Date(app.appliedAt) : now;
      const key = monthKey(d);
      if (!monthMap.has(key)) continue;
      const bucket = monthMap.get(key);
      bucket.total += 1;
      if (app.status === "APPROVED") bucket.approved += 1;
      else if (app.status === "REJECTED") bucket.rejected += 1;
      else bucket.pending += 1;
    }

    const admissionsByMonth = Array.from(monthMap.values());

    // 2) Pass rate by course
    const exams = await Exam.find()
      .populate({
        path: "offering",
        populate: { path: "course" },
      })
      .lean();

    const examIds = exams.map((ex) => ex._id);
    const results = examIds.length
      ? await ExamResult.find({ exam: { $in: examIds } })
          .select("exam marks status")
          .lean()
      : [];

    const examById = new Map();
    exams.forEach((ex) => examById.set(String(ex._id), ex));

    const passAgg = new Map(); // key: courseId, value { courseCode, courseName, presentCount, passCount }

    for (const r of results) {
      const ex = examById.get(String(r.exam));
      if (!ex || !ex.offering || !ex.offering.course) continue;
      const course = ex.offering.course;
      const key = String(course._id);

      if (!passAgg.has(key)) {
        passAgg.set(key, {
          courseId: key,
          courseCode: course.courseCode || "",
          courseName: course.courseName || "",
          presentCount: 0,
          passCount: 0,
        });
      }

      const bucket = passAgg.get(key);
      if (r.status === "ABSENT") continue;

      bucket.presentCount += 1;
      const maxMarks = ex.maxMarks || 0;
      const passMark = maxMarks > 0 ? maxMarks * 0.4 : 0; // simple rule: 40% pass
      if (typeof r.marks === "number" && r.marks >= passMark) {
        bucket.passCount += 1;
      }
    }

    const passRateByCourse = Array.from(passAgg.values()).map((b) => ({
      courseId: b.courseId,
      courseCode: b.courseCode,
      courseName: b.courseName,
      presentCount: b.presentCount,
      passCount: b.passCount,
      passRate:
        b.presentCount > 0
          ? Math.round((b.passCount / b.presentCount) * 100)
          : null,
    }));

    // 3) Attendance by course (overall)
    const attendanceRecords = await AttendanceRecord.find()
      .populate({
        path: "session",
        select: "offering",
        populate: {
          path: "offering",
          select: "course",
          populate: { path: "course" },
        },
      })
      .select("status")
      .lean();

    const attendAgg = new Map(); // key: courseId, value { presentCount, totalCount, courseName, courseCode }

    for (const rec of attendanceRecords) {
      const session = rec.session;
      if (!session || !session.offering || !session.offering.course) continue;
      const course = session.offering.course;
      const key = String(course._id);

      if (!attendAgg.has(key)) {
        attendAgg.set(key, {
          courseId: key,
          courseCode: course.courseCode || "",
          courseName: course.courseName || "",
          presentCount: 0,
          totalCount: 0,
        });
      }

      const bucket = attendAgg.get(key);
      bucket.totalCount += 1;
      if (rec.status === "PRESENT") bucket.presentCount += 1;
    }

    const attendanceByCourse = Array.from(attendAgg.values()).map((b) => ({
      courseId: b.courseId,
      courseCode: b.courseCode,
      courseName: b.courseName,
      presentCount: b.presentCount,
      totalCount: b.totalCount,
      attendanceRate:
        b.totalCount > 0
          ? Math.round((b.presentCount / b.totalCount) * 100)
          : null,
    }));

    return NextResponse.json(
      {
        admissionsByMonth,
        passRateByCourse,
        attendanceByCourse,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/admin-analytics/overview error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
