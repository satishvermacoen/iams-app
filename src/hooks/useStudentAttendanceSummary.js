// src/hooks/useStudentAttendanceSummary.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useStudentAttendanceSummary() {
  return useQuery({
    queryKey: ["student-attendance-summary"],
    queryFn: () => apiGet("/api/me/student-attendance-summary"),
  });
}
