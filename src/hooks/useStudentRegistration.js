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

export function useMyEnrollments() {
    return useQuery({
        queryKey: ["my-enrollments"],
        queryFn: () => apiGet("/api/enrollments"),
    });
}

export function useRegisterCourse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (offeringId) => {
            const res = await authFetch("/api/enrollments", {
                method: "POST",
                body: JSON.stringify({ offeringId }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to register");
            return data.item;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-enrollments"] });
            qc.invalidateQueries({ queryKey: ["student-dashboard"] }); // Update dashboard counts if any
        },
    });
}

export function useDropCourse() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (enrollmentId) => {
            const res = await authFetch(`/api/enrollments/${enrollmentId}`, {
                method: "DELETE",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Failed to drop course");
            return true;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-enrollments"] });
            qc.invalidateQueries({ queryKey: ["student-dashboard"] });
        },
    });
}
