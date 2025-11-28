// src/app/dashboard/student/my-timetable/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectStudentMyTimetable() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/student/timetable");
  }, [router]);
  return null;
}
