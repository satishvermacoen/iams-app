// src/app/api/exams/results/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ExamResult from "@/models/ExamResult";
import { requireRole } from "@/lib/auth";

// GET /api/exams/results?examId=&studentId=
export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status: authStatus } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
      "STUDENT",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const studentId = searchParams.get("studentId");

    const query = {};
    if (examId) query.exam = examId;
    if (studentId) query.student = studentId;

    const items = await ExamResult.find(query).populate("exam").populate("student").lean();
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Exam results list error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST bulk upload results
// body: { examId, results: [{ studentId, marksObtained, grade }] }
export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status: authStatus } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    const body = await req.json();
    const { examId, results } = body;

    if (!examId || !Array.isArray(results)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const ops = results.map((r) => ({
      updateOne: {
        filter: { exam: examId, student: r.studentId },
        update: {
          $set: {
            exam: examId,
            student: r.studentId,
            marksObtained: r.marksObtained,
            grade: r.grade,
            resultPublishedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (ops.length) {
      await ExamResult.bulkWrite(ops);
    }

    return NextResponse.json({ message: "Results saved" }, { status: 200 });
  } catch (err) {
    console.error("Exam results create error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
