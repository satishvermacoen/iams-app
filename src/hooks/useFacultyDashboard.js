// src/hooks/useFacultyDashboard.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useFacultyDashboard() {
  return useQuery({
    queryKey: ["faculty-dashboard"],
    queryFn: () => apiGet("/api/me/faculty"),
  });
}
