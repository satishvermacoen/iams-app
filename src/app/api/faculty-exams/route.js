// src/app/api/faculty-exams/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Exam from "@/models/Exam";
import CourseOffering from "@/models/CourseOffering";

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
    const offeringId = searchParams.get("offeringId");

    const query = {};
    if (offeringId) query.offering = offeringId;

    const exams = await Exam.find(query)
      .sort({ examDate: 1 })
      .populate({
        path: "offering",
        populate: [{ path: "course" }, { path: "semester" }],
      })
      .lean();

    return NextResponse.json({ items: exams }, { status: 200 });
  } catch (err) {
    console.error("GET /api/faculty-exams error:", err);
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
    const { offeringId, title, type, examDate, maxMarks, weightage } = body;

    if (!offeringId || !title || !examDate || !maxMarks) {
      return NextResponse.json(
        { message: "offeringId, title, examDate, maxMarks are required" },
        { status: 400 }
      );
    }

    const offeringExists = await CourseOffering.exists({ _id: offeringId });
    if (!offeringExists) {
      return NextResponse.json(
        { message: "Invalid offeringId" },
        { status: 400 }
      );
    }

    const exam = await Exam.create({
      offering: offeringId,
      title,
      type: type || "INTERNAL",
      examDate: new Date(examDate),
      maxMarks,
      weightage,
    });

    const populated = await Exam.findById(exam._id)
      .populate({
        path: "offering",
        populate: [{ path: "course" }, { path: "semester" }],
      })
      .lean();

    return NextResponse.json({ item: populated }, { status: 201 });
  } catch (err) {
    console.error("POST /api/faculty-exams error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
