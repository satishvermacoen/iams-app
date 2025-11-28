// src/app/api/me/admin/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import AdmissionApplication from "@/models/AdmissionApplication";
import Student from "@/models/Student";
import Faculty from "@/models/Faculty";
// Ensure referenced models are registered
import "@/models/Program";
import "@/models/Semester";
import "@/models/Department";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const [pendingApplications, totalStudents, totalFaculty, recentApplications] =
      await Promise.all([
        AdmissionApplication.countDocuments({ status: "PENDING" }),
        Student.countDocuments(),
        Faculty.countDocuments(),
        AdmissionApplication.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("program")
          .lean(),
      ]);

    return NextResponse.json(
      {
        stats: {
          pendingApplications,
          totalStudents,
          totalFaculty,
        },
        recentApplications,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me/admin error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
