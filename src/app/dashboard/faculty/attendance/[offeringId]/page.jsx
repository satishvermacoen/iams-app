// src/app/dashboard/faculty/attendance/[offeringId]/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOfferingRosterWithAttendance, useSaveAttendance } from "@/hooks/useFacultyAttendance";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

function formatDateInputValue(date) {
  // YYYY-MM-DD
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function FacultyAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const offeringId = params.offeringId;

  const [sessionDate, setSessionDate] = useState(() => formatDateInputValue(new Date()));
  const [localList, setLocalList] = useState([]); // local statuses

  const {
    data,
    isLoading,
    error,
  } = useOfferingRosterWithAttendance({
    offeringId,
    sessionDate,
  });

  const saveAttendance = useSaveAttendance();

  const session = data?.session;
  const students = data?.students || [];

  // Sync query students to local state
  useEffect(() => {
    if (students.length > 0) {
      setLocalList(
        students.map((s) => ({
          ...s,
        }))
      );
    } else {
      setLocalList([]);
    }
  }, [students]);

  const presentCount = useMemo(
    () => localList.filter((s) => s.status === "PRESENT").length,
    [localList]
  );

  const totalCount = localList.length;

  function updateStatus(enrollmentId, status) {
    setLocalList((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId ? { ...s, status } : s
      )
    );
  }

  async function handleSave() {
    if (!session?._id) return;
    try {
      await saveAttendance.mutateAsync({
        sessionId: session._id,
        offeringId,
        records: localList.map((s) => ({
          enrollmentId: s.enrollmentId,
          status: s.status,
        })),
      });
      // optionally show toast
      alert("Attendance saved");
    } catch (err) {
      console.error("Save attendance error:", err);
      alert(err.message || "Failed to save attendance");
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Mark Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Course Offering ID: {offeringId}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Session</CardTitle>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Date:</span>
            <Input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-auto"
            />
            <span className="ml-4 text-xs text-muted-foreground">
              Present: {presentCount} / {totalCount}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-red-500">
              {error.message || "Failed to load roster"}
            </p>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading roster and attendance...
            </p>
          ) : localList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students enrolled in this offering.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Enrollment No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Toggle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localList.map((s, idx) => (
                      <TableRow key={s.enrollmentId}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{s.enrollmentNo || "-"}</TableCell>
                        <TableCell>{s.fullName || "-"}</TableCell>
                        <TableCell className="text-xs">
                          {s.email || "-"}
                        </TableCell>
                        <TableCell>{s.status}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="xs"
                            variant={
                              s.status === "PRESENT" ? "default" : "outline"
                            }
                            onClick={() =>
                              updateStatus(s.enrollmentId, "PRESENT")
                            }
                          >
                            Present
                          </Button>
                          <Button
                            size="xs"
                            variant={
                              s.status === "ABSENT" ? "default" : "outline"
                            }
                            onClick={() =>
                              updateStatus(s.enrollmentId, "ABSENT")
                            }
                          >
                            Absent
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setLocalList((prev) =>
                      prev.map((s) => ({ ...s, status: "PRESENT" }))
                    )
                  }
                >
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setLocalList((prev) =>
                      prev.map((s) => ({ ...s, status: "ABSENT" }))
                    )
                  }
                >
                  Mark All Absent
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveAttendance.isLoading || !session?._id}
                >
                  {saveAttendance.isLoading ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
