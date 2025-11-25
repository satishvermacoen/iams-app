// src/app/api/faculty-exams/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Exam from "@/models/Exam";
import CourseOffering from "@/models/CourseOffering";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const exam = await Exam.findById(params.id)
      .populate({
        path: "offering",
        populate: [{ path: "course" }, { path: "semester" }],
      })
      .lean();

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ item: exam }, { status: 200 });
  } catch (err) {
    console.error("GET /api/faculty-exams/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { title, type, examDate, maxMarks, weightage } = body;

    const exam = await Exam.findById(params.id);
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    if (title !== undefined) exam.title = title;
    if (type !== undefined) exam.type = type;
    if (examDate !== undefined) exam.examDate = new Date(examDate);
    if (maxMarks !== undefined) exam.maxMarks = maxMarks;
    if (weightage !== undefined) exam.weightage = weightage;

    await exam.save();

    const populated = await Exam.findById(exam._id)
      .populate({
        path: "offering",
        populate: [{ path: "course" }, { path: "semester" }],
      })
      .lean();

    return NextResponse.json({ item: populated }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/faculty-exams/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const exam = await Exam.findByIdAndDelete(params.id);
    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/faculty-exams/[id] error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
