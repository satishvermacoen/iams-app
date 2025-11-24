// src/app/api/me/faculty/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Faculty from "@/models/Faculty";
import CourseOffering from "@/models/CourseOffering";
import AttendanceSession from "@/models/AttendanceSession";
import Exam from "@/models/Exam";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["FACULTY"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const faculty = await Faculty.findOne({ user: user._id })
      .populate("department")
      .lean();

    if (!faculty) {
      return NextResponse.json(
        { message: "Faculty profile not found" },
        { status: 404 }
      );
    }

    const offerings = await CourseOffering.find({ faculty: faculty._id })
      .populate("course")
      .populate("semester")
      .lean();

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const offeringIds = offerings.map((o) => o._id);
    const todaySessions = await AttendanceSession.find({
      offering: { $in: offeringIds },
      sessionDate: { $gte: startOfDay, $lt: endOfDay },
    })
      .populate({
        path: "offering",
        populate: { path: "course" },
      })
      .lean();

    const upcomingExams = await Exam.find({
      offering: { $in: offeringIds },
      examDate: { $gte: new Date() },
    })
      .sort({ examDate: 1 })
      .limit(5)
      .populate({
        path: "offering",
        populate: { path: "course" },
      })
      .lean();

    return NextResponse.json(
      {
        faculty,
        offerings,
        todaySessions,
        upcomingExams,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me/faculty error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
