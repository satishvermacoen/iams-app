import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import CourseOffering from "@/models/CourseOffering";
import "@/models/Course";
import "@/models/Semester";
import "@/models/Faculty";
import "@/models/User";

// GET /api/course-offerings/[id]
export async function GET(req, { params }) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, [
            "ADMIN",
            "SUPER_ADMIN",
            "FACULTY",
            "STUDENT",
        ]);
        if (error) return NextResponse.json({ message: error }, { status });

        const { id } = await params;
        const offering = await CourseOffering.findById(id)
            .populate("course")
            .populate("semester")
            .populate({ path: "faculty", populate: { path: "user" } })
            .lean();

        if (!offering) {
            return NextResponse.json({ message: "Course offering not found" }, { status: 404 });
        }

        return NextResponse.json({ item: offering }, { status: 200 });
    } catch (err) {
        console.error("GET /api/course-offerings/[id] error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// PATCH /api/course-offerings/[id] (Admin only)
export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
        if (error) return NextResponse.json({ message: error }, { status });

        const { id } = await params;
        const body = await req.json();
        const { facultyId, section, maxCapacity, schedule } = body;

        const updates = {};
        if (facultyId) updates.faculty = facultyId;
        if (section) updates.section = section;
        if (maxCapacity) updates.maxCapacity = maxCapacity;
        if (schedule) updates.schedule = schedule;

        const offering = await CourseOffering.findByIdAndUpdate(id, updates, {
            new: true,
        })
            .populate("course")
            .populate("semester")
            .populate({ path: "faculty", populate: { path: "user" } });

        if (!offering) {
            return NextResponse.json({ message: "Course offering not found" }, { status: 404 });
        }

        return NextResponse.json({ item: offering }, { status: 200 });
    } catch (err) {
        console.error("PATCH /api/course-offerings/[id] error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// DELETE /api/course-offerings/[id] (Admin only)
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        const { user, error, status } = await requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
        if (error) return NextResponse.json({ message: error }, { status });

        const { id } = await params;
        const deleted = await CourseOffering.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ message: "Course offering not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Course offering deleted" }, { status: 200 });
    } catch (err) {
        console.error("DELETE /api/course-offerings/[id] error:", err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
