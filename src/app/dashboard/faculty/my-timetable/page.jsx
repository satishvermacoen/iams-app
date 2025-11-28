// src/app/dashboard/faculty/my-timetable/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectFacultyMyTimetable() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/faculty/timetable");
  }, [router]);
  return null;
}
