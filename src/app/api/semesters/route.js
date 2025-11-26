import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Semester from "@/models/Semester";
import { requireRole } from "@/lib/auth";

// GET /api/semesters?programId=...
export async function GET(req) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN", "FACULTY", "STUDENT"]);
        if (error) return NextResponse.json({ message: error }, { status });

        const { searchParams } = new URL(req.url);
        const programId = searchParams.get("programId");

        const query = {};
        if (programId) query.program = programId;

        const items = await Semester.find(query).sort({ sequenceNo: 1 }).lean();
        return NextResponse.json({ items }, { status: 200 });
    } catch (err) {
        console.error("GET /api/semesters error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// POST /api/semesters (Admin only)
export async function POST(req) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
        if (error) return NextResponse.json({ message: error }, { status });

        const body = await req.json();
        const { name, sequenceNo, academicYear, programId } = body;

        if (!name || !sequenceNo || !academicYear || !programId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const semester = await Semester.create({
            name,
            sequenceNo,
            academicYear,
            program: programId,
        });

        return NextResponse.json({ item: semester }, { status: 201 });
    } catch (err) {
        console.error("POST /api/semesters error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
