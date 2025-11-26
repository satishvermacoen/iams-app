// src/lib/db.js
import mongoose from "mongoose";
const DB_NAME = "iams_db";

const MONGODB_URI = process.env.MONGODB_URI;
// console.log("MONGODB_URI:", MONGODB_URI);
// To avoid multiple connections in Next.js hot-reload / serverless
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in .env.local");
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(`${MONGODB_URI}/${DB_NAME}`, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
