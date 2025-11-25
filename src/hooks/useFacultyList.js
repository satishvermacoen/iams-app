// src/hooks/useFacultyList.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useFacultyList() {
  return useQuery({
    queryKey: ["faculty-list"],
    queryFn: () => apiGet("/api/admin-faculty"),
  });
}
