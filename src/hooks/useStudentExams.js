// src/hooks/useStudentExams.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useStudentExams() {
  return useQuery({
    queryKey: ["student-exams"],
    queryFn: () => apiGet("/api/me/student-exams"),
  });
}
