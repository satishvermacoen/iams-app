// src/app/api/students/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Student from "@/models/Student";
import Program from "@/models/Program";
import Semester from "@/models/Semester";
import User from "@/models/User";
import Role from "@/models/Role";
import { requireRole, hashPassword } from "@/lib/auth";

// GET /api/students
export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status: authStatus } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    const items = await Student.find()
      .populate("user")
      .populate("program")
      .populate("currentSemester")
      .lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("Students list error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST /api/students - admin creates student + user
export async function POST(req) {
  try {
    await connectDB();
    const { user, error, status: authStatus } = await requireRole(req, [
      "ADMIN",
      "SUPER_ADMIN",
    ]);
    if (error) return NextResponse.json({ message: error }, { status: authStatus });

    const body = await req.json();
    const {
      fullName,
      email,
      password,
      programId,
      semesterId,
      enrollmentNo,
    } = body;

    if (!fullName || !email || !password || !programId || !semesterId || !enrollmentNo) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const program = await Program.findById(programId);
    const semester = await Semester.findById(semesterId);

    if (!program || !semester) {
      return NextResponse.json({ message: "Invalid program or semester" }, { status: 400 });
    }

    let studentRole = await Role.findOne({ name: "STUDENT" });
    if (!studentRole) {
      studentRole = await Role.create({ name: "STUDENT", description: "Student role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const userDoc = await User.create({
      email,
      fullName,
      passwordHash,
      role: studentRole._id,
    });

    const student = await Student.create({
      user: userDoc._id,
      program: program._id,
      currentSemester: semester._id,
      enrollmentNo,
    });

    return NextResponse.json({ item: student }, { status: 201 });
  } catch (err) {
    console.error("Students create error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

