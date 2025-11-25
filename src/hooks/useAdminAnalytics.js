// src/hooks/useAdminAnalytics.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics-overview"],
    queryFn: () => apiGet("/api/admin-analytics/overview"),
  });
}
