import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import { requireRole } from "@/lib/auth";

// GET /api/courses
export async function GET(req) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "FACULTY", "STUDENT"]);
        if (error) return NextResponse.json({ message: error }, { status });

        const courses = await Course.find().sort({ courseCode: 1 }).lean();
        return NextResponse.json({ items: courses }, { status: 200 });
    } catch (err) {
        console.error("GET /api/courses error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// POST /api/courses (Admin only)
export async function POST(req) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
        if (error) return NextResponse.json({ message: error }, { status });

        const body = await req.json();
        const { courseCode, courseName, credits, type, programId } = body;

        if (!courseCode || !courseName || !credits) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existing = await Course.findOne({ courseCode });
        if (existing) {
            return NextResponse.json({ message: "Course code already exists" }, { status: 409 });
        }

        const course = await Course.create({
            courseCode,
            courseName,
            credits,
            type: type || "CORE",
            program: programId || null,
        });

        return NextResponse.json({ item: course }, { status: 201 });
    } catch (err) {
        console.error("POST /api/courses error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
