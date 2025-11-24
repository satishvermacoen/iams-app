// src/app/api/auth/signup/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password, fullName, roleName = "STUDENT" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    let role = await Role.findOne({ name: roleName });
    if (!role) {
      role = await Role.create({ name: roleName, description: `${roleName} role` });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email,
      passwordHash,
      fullName,
      role: role._id,
    });

    const token = signToken({ userId: user._id, role: role.name });

    return NextResponse.json(
      {
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: role.name,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
