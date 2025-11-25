// src/components/student/attendance-summary-card.jsx
"use client";

import { useStudentAttendanceSummary } from "@/hooks/useStudentAttendanceSummary";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export function StudentAttendanceSummaryCard() {
  const { data, isLoading, error } = useStudentAttendanceSummary();
  const courses = data?.courses || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">
            Loading attendance...
          </p>
        ) : error ? (
          <p className="text-sm text-red-500">
            {error.message || "Failed to load attendance"}
          </p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No attendance data yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.enrollmentId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">
                          {c.course?.name || "-"}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {c.course?.code || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{c.attendance.presentCount}</TableCell>
                    <TableCell>{c.attendance.totalCount}</TableCell>
                    <TableCell>
                      {c.attendance.percentage != null
                        ? `${c.attendance.percentage}%`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
