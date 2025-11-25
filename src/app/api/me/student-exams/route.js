// src/app/api/me/student-exams/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";
import Exam from "@/models/Exam";
import ExamResult from "@/models/ExamResult";

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
        populate: [{ path: "course" }, { path: "semester" }],
      })
      .lean();

    const enrollmentIds = enrollments.map((e) => e._id);
    const offeringIds = enrollments
      .map((e) => e.offering?._id)
      .filter(Boolean);

    if (offeringIds.length === 0) {
      return NextResponse.json(
        { student, courses: [] },
        { status: 200 }
      );
    }

    const exams = await Exam.find({ offering: { $in: offeringIds } })
      .sort({ examDate: 1 })
      .lean();

    const examIds = exams.map((ex) => ex._id);

    const results = await ExamResult.find({
      exam: { $in: examIds },
      enrollment: { $in: enrollmentIds },
    })
      .select("exam enrollment marks grade status")
      .lean();

    const resultMapByExamEnrollment = new Map();
    results.forEach((r) => {
      resultMapByExamEnrollment.set(
        `${String(r.exam)}:${String(r.enrollment)}`,
        r
      );
    });

    const examsByOffering = exams.reduce((acc, ex) => {
      const offId = String(ex.offering);
      if (!acc[offId]) acc[offId] = [];
      acc[offId].push(ex);
      return acc;
    }, {});

    const courses = enrollments.map((en) => {
      const off = en.offering || {};
      const course = off.course || {};
      const semester = off.semester || {};

      const examsForOffering = examsByOffering[String(off._id)] || [];

      const examDetails = examsForOffering.map((ex) => {
        const r =
          resultMapByExamEnrollment.get(
            `${String(ex._id)}:${String(en._id)}`
          ) || null;
        return {
          examId: ex._id,
          title: ex.title,
          type: ex.type,
          examDate: ex.examDate,
          maxMarks: ex.maxMarks,
          weightage: ex.weightage,
          marks: r?.marks ?? null,
          grade: r?.grade ?? null,
          status: r?.status ?? null,
        };
      });

      // Simple overall: sum(marks)/sum(maxMarks)
      const totalMax = examDetails
        .filter((ex) => ex.marks != null)
        .reduce((sum, ex) => sum + (ex.maxMarks || 0), 0);
      const totalMarks = examDetails
        .filter((ex) => ex.marks != null)
        .reduce((sum, ex) => sum + (ex.marks || 0), 0);

      const percentage =
        totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : null;

      return {
        enrollmentId: en._id,
        course: {
          id: course._id,
          name: course.courseName,
          code: course.courseCode,
        },
        semester: {
          id: semester._id,
          name: semester.name,
        },
        exams: examDetails,
        totalMarks,
        totalMax,
        percentage,
      };
    });

    return NextResponse.json(
      {
        student,
        courses,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me/student-exams error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
