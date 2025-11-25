// src/hooks/useSemesters.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useSemestersAdmin() {
  return useQuery({
    queryKey: ["semesters-admin"],
    queryFn: () => apiGet("/api/admin-semesters"),
  });
}
