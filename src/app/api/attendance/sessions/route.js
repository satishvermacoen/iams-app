// src/app/api/attendance/sessions/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AttendanceSession from "@/models/AttendanceSession";
import CourseOffering from "@/models/CourseOffering";
import { requireRole } from "@/lib/auth";

// GET list sessions by offeringId
export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status: authStatus } = await requireRole(req, [
      "FACULTY",
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    const { searchParams } = new URL(req.url);
    const offeringId = searchParams.get("offeringId");
    const query = {};
    if (offeringId) query.offering = offeringId;

    const items = await AttendanceSession.find(query).sort({ sessionDate: -1 }).lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Attendance sessions list error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST create session
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
    const { offeringId, sessionDate, startTime, endTime, mode } = body;

    if (!offeringId || !sessionDate) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const offeringExists = await CourseOffering.exists({ _id: offeringId });
    if (!offeringExists) {
      return NextResponse.json({ message: "Invalid offeringId" }, { status: 400 });
    }

    const session = await AttendanceSession.create({
      offering: offeringId,
      sessionDate,
      startTime,
      endTime,
      mode,
    });

    return NextResponse.json({ item: session }, { status: 201 });
  } catch (err) {
    console.error("Attendance sessions create error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
