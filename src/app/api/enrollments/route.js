import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Student from "@/models/Student";
import CourseOffering from "@/models/CourseOffering";
import "@/models/Course";
import "@/models/Semester";
import "@/models/Faculty";
import "@/models/User";

// GET /api/enrollments
// Returns enrollments for the logged-in student
export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const student = await Student.findOne({ user: user.userId });
    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    const items = await Enrollment.find({ student: student._id })
      .populate({
        path: "offering",
        populate: [
          { path: "course" },
          { path: "semester" },
          { path: "faculty", populate: { path: "user" } },
        ],
      })
      .lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/enrollments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/enrollments
// Register for a course offering
export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { offeringId } = body;

    if (!offeringId) {
      return NextResponse.json({ message: "offeringId is required" }, { status: 400 });
    }

    const student = await Student.findOne({ user: user.userId });
    if (!student) {
      return NextResponse.json({ message: "Student profile not found" }, { status: 404 });
    }

    // Check if offering exists
    const offering = await CourseOffering.findById(offeringId);
    if (!offering) {
      return NextResponse.json({ message: "Course offering not found" }, { status: 404 });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: student._id,
      offering: offeringId,
    });

    if (existing) {
      return NextResponse.json({ message: "Already enrolled in this course" }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: student._id,
      offering: offeringId,
      status: "ENROLLED",
    });

    return NextResponse.json({ item: enrollment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/enrollments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
