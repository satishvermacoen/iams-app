// src/lib/auth.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "./db";
import User from "@/models/User";
import Role from "@/models/Role";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Create JWT
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Extract user from Authorization header
export async function getUserFromRequest(req) {
  await connectDB();

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  const user = await User.findById(decoded.userId).populate("role");
  return user;
}

// Middleware style helper for route handlers
export async function requireAuth(req) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return { error: "Unauthorized", status: 401, user: null };
  }
  return { user, error: null, status: 200 };
}

export async function requireRole(req, allowedRoles = []) {
  const { user, error, status } = await requireAuth(req);
  if (error) return { user: null, error, status };

  const roleName = user.role?.name;
  if (!allowedRoles.length || allowedRoles.includes(roleName)) {
    return { user, error: null, status: 200 };
  }

  return { user: null, error: "Forbidden: insufficient permissions", status: 403 };
}

// Password helpers
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
