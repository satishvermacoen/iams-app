// src/app/api/faculty-attendance/sessions/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import AttendanceSession from "@/models/AttendanceSession";
import CourseOffering from "@/models/CourseOffering";

/**
 * POST /api/faculty-attendance/sessions
 * Body: { offeringId, sessionDate }
 * Creates or returns existing session for the given offering + date.
 */
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
    const { offeringId, sessionDate } = body;

    if (!offeringId || !sessionDate) {
      return NextResponse.json(
        { message: "offeringId and sessionDate are required" },
        { status: 400 }
      );
    }

    const offering = await CourseOffering.findById(offeringId);
    if (!offering) {
      return NextResponse.json(
        { message: "Course offering not found" },
        { status: 404 }
      );
    }

    const date = new Date(sessionDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { message: "Invalid sessionDate" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    let session = await AttendanceSession.findOne({
      offering: offeringId,
      sessionDate: { $gte: startOfDay, $lt: endOfDay },
    });

    if (!session) {
      session = await AttendanceSession.create({
        offering: offeringId,
        sessionDate: startOfDay,
      });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (err) {
    console.error("POST /api/faculty-attendance/sessions error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
