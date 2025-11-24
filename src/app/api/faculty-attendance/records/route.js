// src/app/api/faculty-attendance/records/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import AttendanceRecord from "@/models/AttendanceRecord";

/**
 * GET /api/faculty-attendance/records?sessionId=...
 */
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
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json(
        { message: "sessionId is required" },
        { status: 400 }
      );
    }

    const records = await AttendanceRecord.find({ session: sessionId })
      .select("enrollment status")
      .lean();

    const items = records.map((r) => ({
      enrollmentId: r.enrollment,
      status: r.status,
    }));

    return NextResponse.json({ records: items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/faculty-attendance/records error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/**
 * POST /api/faculty-attendance/records
 * Body: { sessionId, records: [{ enrollmentId, status }] }
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
    const { sessionId, records } = body;

    if (!sessionId || !Array.isArray(records)) {
      return NextResponse.json(
        { message: "sessionId and records[] are required" },
        { status: 400 }
      );
    }

    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { session: sessionId, enrollment: r.enrollmentId },
        update: {
          session: sessionId,
          enrollment: r.enrollmentId,
          status: r.status || "ABSENT",
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await AttendanceRecord.bulkWrite(bulkOps);
    }

    return NextResponse.json(
      { message: "Attendance saved successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/faculty-attendance/records error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
