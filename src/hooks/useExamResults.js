// src/hooks/useExamResults.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth-client";

function authFetch(url, options = {}) {
  const token = typeof window !== "undefined" ? getToken() : null;
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export function useExamResults(examId, offeringId) {
  return useQuery({
    queryKey: ["exam-results", { examId, offeringId }],
    enabled: !!examId,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("examId", examId);
      return apiGet(`/api/faculty-exam-results?${params.toString()}`);
    },
  });
}

export function useSaveExamResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, offeringId, records }) => {
      const res = await authFetch("/api/faculty-exam-results", {
        method: "POST",
        body: JSON.stringify({ examId, records }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Failed to save exam results");
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["exam-results", { examId: variables.examId, offeringId: variables.offeringId }],
      });
    },
  });
}
