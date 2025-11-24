// src/app/api/exams/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Exam from "@/models/Exam";
import CourseOffering from "@/models/CourseOffering";
import { requireRole } from "@/lib/auth";

// GET /api/exams?offeringId=
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
    const offeringId = searchParams.get("offeringId");
    const query = {};
    if (offeringId) query.offering = offeringId;

    const items = await Exam.find(query).sort({ examDate: 1 }).lean();
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Exams list error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST create exam
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
    const { offeringId, examType, examDate, maxMarks, weightagePercent } = body;

    if (!offeringId || !examType || !examDate || !maxMarks || !weightagePercent) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const offeringExists = await CourseOffering.exists({ _id: offeringId });
    if (!offeringExists) {
      return NextResponse.json({ message: "Invalid offeringId" }, { status: 400 });
    }

    const exam = await Exam.create({
      offering: offeringId,
      examType,
      examDate,
      maxMarks,
      weightagePercent,
    });

    return NextResponse.json({ item: exam }, { status: 201 });
  } catch (err) {
    console.error("Exams create error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
