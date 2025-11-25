// src/hooks/useFacultyExams.js
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

export function useFacultyExams(offeringId) {
  return useQuery({
    queryKey: ["faculty-exams", { offeringId }],
    enabled: !!offeringId,
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("offeringId", offeringId);
      return apiGet(`/api/faculty-exams?${params.toString()}`);
    },
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await authFetch("/api/faculty-exams", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create exam");
      return data.item;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["faculty-exams", { offeringId: variables.offeringId }],
      });
    },
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ examId, offeringId }) => {
      const res = await authFetch(`/api/faculty-exams/${examId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete exam");
      return true;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["faculty-exams", { offeringId: variables.offeringId }],
      });
    },
  });
}
