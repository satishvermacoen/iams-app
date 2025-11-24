// src/hooks/useAvailableOfferings.js
"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useAvailableOfferings({ programId, semesterId, search }) {
  return useQuery({
    queryKey: ["course-offerings-available", { programId, semesterId, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programId) params.set("programId", programId);
      if (semesterId) params.set("semesterId", semesterId);
      if (search) params.set("search", search);

      const qs = params.toString();
      const url = qs ? `/api/course-offerings?${qs}` : "/api/course-offerings";

      return apiGet(url); // { items: [...] }
    },
    enabled: !!programId && !!semesterId, // wait until we know student's program/semester
  });
}
