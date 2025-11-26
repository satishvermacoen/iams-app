import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({ status: "ok", database: "connected" }, { status: 200 });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json(
            { status: "error", database: "disconnected", error: error.message },
            { status: 500 }
        );
    }
}
