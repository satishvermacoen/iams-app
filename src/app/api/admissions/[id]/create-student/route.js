// src/app/api/admissions/[id]/create-student/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, hashPassword } from "@/lib/auth";
import AdmissionApplication from "@/models/AdmissionApplication";
import User from "@/models/User";
import Student from "@/models/Student";
import Program from "@/models/Program";

function generateRandomPassword(length = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { user: adminUser, error, status } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status });

    const body = await req.json();
    const { enrollmentNo } = body;

    if (!enrollmentNo) {
      return NextResponse.json(
        { message: "enrollmentNo is required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const app = await AdmissionApplication.findById(id).populate("program");
    if (!app) {
      return NextResponse.json(
        { message: "Admission application not found" },
        { status: 404 }
      );
    }

    if (!app.program) {
      return NextResponse.json(
        { message: "Application has no linked program" },
        { status: 400 }
      );
    }

    // Prevent double-conversion
    if (app.linkedStudent) {
      return NextResponse.json(
        { message: "Student already created for this application" },
        { status: 409 }
      );
    }

    // Optional: require APPROVED status
    if (app.status !== "APPROVED") {
      return NextResponse.json(
        { message: "Application must be APPROVED before creating student" },
        { status: 400 }
      );
    }

    // Ensure program still exists
    const program = await Program.findById(app.program._id);
    if (!program) {
      return NextResponse.json(
        { message: "Program not found for this application" },
        { status: 400 }
      );
    }

    const email = (app.email || "").toLowerCase();
    if (!email) {
      return NextResponse.json(
        { message: "Application email is missing" },
        { status: 400 }
      );
    }

    // 1) Find or create User
    let studentUser = await User.findOne({ email });

    let generatedPassword = null;
    if (!studentUser) {
      generatedPassword = generateRandomPassword(10);
      const passwordHash = await hashPassword(generatedPassword);

      studentUser = await User.create({
        fullName: app.applicantName,
        email: email,
        password: passwordHash,
        role: "STUDENT",
      });
    } else {
      // Ensure role at least STUDENT
      if (studentUser.role !== "STUDENT") {
        studentUser.role = "STUDENT";
        await studentUser.save();
      }
    }

    // 2) Create Student record
    const existingStudent = await Student.findOne({ user: studentUser._id });
    if (existingStudent) {
      // Link existing student to application
      app.linkedStudent = existingStudent._id;
      app.linkedUser = studentUser._id;
      await app.save();

      return NextResponse.json(
        {
          message: "Existing student linked to this application",
          student: existingStudent,
          user: studentUser,
          generatedPassword: null,
        },
        { status: 200 }
      );
    }

    const student = await Student.create({
      user: studentUser._id,
      program: program._id,
      enrollmentNo,
      status: "ACTIVE",
      // currentSemester: null // can be set later via admin UI
    });

    // 3) Update application linkage
    app.linkedStudent = student._id;
    app.linkedUser = studentUser._id;
    if (!app.decisionAt) {
      app.decisionAt = new Date();
    }
    await app.save();

    return NextResponse.json(
      {
        message: "Student created and linked successfully",
        student,
        user: studentUser,
        generatedPassword, // null if user already existed
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admissions/[id]/create-student error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
