// src/hooks/useCourseOfferingsAdmin.js
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

export function useCourseOfferingsAdmin(filters) {
  const { programId, semesterId, search } = filters || {};
  return useQuery({
    queryKey: ["course-offerings-admin", { programId, semesterId, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (programId) params.set("programId", programId);
      if (semesterId) params.set("semesterId", semesterId);
      if (search) params.set("search", search);
      const qs = params.toString();
      const url = qs
        ? `/api/admin-course-offerings?${qs}`
        : "/api/admin-course-offerings";
      return apiGet(url);
    },
  });
}

export function useCreateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const res = await authFetch("/api/admin-course-offerings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create offering");
      return data.item;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-offerings-admin"] });
    },
  });
}

export function useUpdateOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const res = await authFetch(`/api/admin-course-offerings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update offering");
      return data.item;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-offerings-admin"] });
    },
  });
}

export function useDeleteOffering() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await authFetch(`/api/admin-course-offerings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to delete offering");
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course-offerings-admin"] });
    },
  });
}
