// src/hooks/useFacultyAttendance.js
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

// Helper to create/get session
async function ensureSession(offeringId, sessionDate) {
  const res = await authFetch("/api/faculty-attendance/sessions", {
    method: "POST",
    body: JSON.stringify({ offeringId, sessionDate }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Failed to create/get session");
  }
  return data.session;
}

export function useOfferingRosterWithAttendance({ offeringId, sessionDate }) {
  return useQuery({
    queryKey: ["faculty-attendance", { offeringId, sessionDate }],
    enabled: !!offeringId && !!sessionDate,
    queryFn: async () => {
      const session = await ensureSession(offeringId, sessionDate);

      const params = new URLSearchParams({ offeringId });
      const rosterRes = await apiGet(
        `/api/enrollments/by-offering?${params.toString()}`
      );
      const roster = rosterRes.items || [];

      const recParams = new URLSearchParams({ sessionId: session._id });
      const recRes = await apiGet(
        `/api/faculty-attendance/records?${recParams.toString()}`
      );
      const records = recRes.records || [];

      const recordMap = new Map(
        records.map((r) => [String(r.enrollmentId), r.status])
      );

      const students = roster.map((st) => ({
        enrollmentId: st.enrollmentId,
        studentId: st.studentId,
        fullName: st.fullName,
        enrollmentNo: st.enrollmentNo,
        email: st.email,
        programName: st.programName,
        status: recordMap.get(String(st.enrollmentId)) || "ABSENT",
      }));

      return {
        session,
        students,
      };
    },
  });
}

export function useSaveAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, records }) => {
      const res = await authFetch("/api/faculty-attendance/records", {
        method: "POST",
        body: JSON.stringify({ sessionId, records }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to save attendance");
      }
      return data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["faculty-attendance", { offeringId: variables.offeringId }],
      });
    },
  });
}
