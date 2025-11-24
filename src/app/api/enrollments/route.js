// src/app/api/enrollments/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Student from "@/models/Student";
import Enrollment from "@/models/Enrollment";
import CourseOffering from "@/models/CourseOffering";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const student = await Student.findOne({ user: user._id })
      .populate("program")
      .populate("currentSemester")
      .lean();

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const enrollments = await Enrollment.find({
      student: student._id,
      status: { $ne: "DROPPED" }, // or { $eq: "ACTIVE" } depending on your schema
    })
      .populate({
        path: "offering",
        populate: [
          { path: "course" },
          { path: "semester" },
          { path: "faculty", populate: { path: "user" } },
        ],
      })
      .lean();

    return NextResponse.json(
      {
        student,
        enrollments,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/enrollments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireRole(req, ["STUDENT"]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { offeringId } = body;

    if (!offeringId) {
      return NextResponse.json(
        { message: "offeringId is required" },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    const offering = await CourseOffering.findById(offeringId)
      .populate("course")
      .populate("semester")
      .populate("program")
      .lean();

    if (!offering) {
      return NextResponse.json(
        { message: "Course offering not found" },
        { status: 404 }
      );
    }

    // Optional: restrict to same program/semester
    if (
      student.program &&
      offering.program &&
      String(student.program) !== String(offering.program._id)
    ) {
      return NextResponse.json(
        { message: "Offering belongs to a different program" },
        { status: 400 }
      );
    }

    // Check already enrolled
    const already = await Enrollment.exists({
      student: student._id,
      offering: offeringId,
      status: { $ne: "DROPPED" },
    });

    if (already) {
      return NextResponse.json(
        { message: "You are already enrolled in this course" },
        { status: 409 }
      );
    }

    // TODO: optional: check max credits / max courses / capacity

    const enrollment = await Enrollment.create({
      student: student._id,
      offering: offeringId,
      status: "ACTIVE",
    });

    return NextResponse.json({ item: enrollment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/enrollments error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
