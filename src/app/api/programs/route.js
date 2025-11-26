// src/app/api/programs/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Program from "@/models/Program";
import "@/models/Department";

export async function GET() {
  try {
    await connectDB();

    const items = await Program.find().populate("department").sort({ name: 1 }).lean();

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("GET /api/programs error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
