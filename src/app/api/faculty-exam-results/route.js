// src/app/api/faculty-exam-results/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import ExamResult from "@/models/ExamResult";
import Enrollment from "@/models/Enrollment";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    if (!examId) {
      return NextResponse.json(
        { message: "examId is required" },
        { status: 400 }
      );
    }

    const results = await ExamResult.find({ exam: examId })
      .select("enrollment marks grade status")
      .lean();

    const items = results.map((r) => ({
      enrollmentId: r.enrollment,
      marks: r.marks,
      grade: r.grade,
      status: r.status,
    }));

    return NextResponse.json({ records: items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/faculty-exam-results error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { examId, records } = body;

    if (!examId || !Array.isArray(records)) {
      return NextResponse.json(
        { message: "examId and records[] are required" },
        { status: 400 }
      );
    }

    // Optional: validate each enrollment belongs to this exam's offering
    // (skip here for brevity, but you can cross-check with Exam + Enrollment models)

    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { exam: examId, enrollment: r.enrollmentId },
        update: {
          exam: examId,
          enrollment: r.enrollmentId,
          marks: r.marks ?? 0,
          grade: r.grade || "",
          status: r.status || "PRESENT",
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await ExamResult.bulkWrite(bulkOps);
    }

    return NextResponse.json(
      { message: "Exam results saved successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/faculty-exam-results error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
