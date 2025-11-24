// src/hooks/useAdmissions.js
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useAdmissions(statusFilter) {
  return useQuery({
    queryKey: ["admissions", statusFilter],
    queryFn: () =>
      apiGet(
        statusFilter ? `/api/admissions?status=${encodeURIComponent(statusFilter)}` : "/api/admissions"
      ),
  });
}

export function useUpdateAdmissionStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/admissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admissions"] });
    },
  });
}
