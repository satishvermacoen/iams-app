// src/app/api/me/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const { user, error, status } = await requireAuth(req);
    if (error) return NextResponse.json({ message: error }, { status });

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role?.name,
          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
