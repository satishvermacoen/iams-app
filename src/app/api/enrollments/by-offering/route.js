// src/app/api/enrollments/by-offering/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
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
    const offeringId = searchParams.get("offeringId");

    if (!offeringId) {
      return NextResponse.json(
        { message: "offeringId is required" },
        { status: 400 }
      );
    }

    const enrollments = await Enrollment.find({
      offering: offeringId,
      status: { $ne: "DROPPED" },
    })
      .populate({
        path: "student",
        populate: [
          { path: "user" }, // fullName, email
          { path: "program" },
        ],
      })
      .lean();

    const items = enrollments.map((en) => ({
      enrollmentId: en._id,
      studentId: en.student?._id,
      enrollmentNo: en.student?.enrollmentNo,
      fullName: en.student?.user?.fullName,
      email: en.student?.user?.email,
      programName: en.student?.program?.name,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/enrollments/by-offering error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
