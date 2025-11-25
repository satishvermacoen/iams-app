// src/app/dashboard/student/results/page.jsx
"use client";

import { useStudentExams } from "@/hooks/useStudentExams";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function StudentResultsPage() {
  const { data, isLoading, error } = useStudentExams();
  const student = data?.student;
  const courses = data?.courses || [];

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Results</h1>
        <p className="text-sm text-muted-foreground">
          Exam-wise results and overall percentage per course.
        </p>
        {student && (
          <p className="mt-1 text-xs text-muted-foreground">
            {student.program?.name} • {student.currentSemester?.name}
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading results...</p>
      ) : error ? (
        <p className="text-sm text-red-500">
          {error.message || "Failed to load results"}
        </p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No exam data available yet.
        </p>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => (
            <Card key={c.enrollmentId}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {c.course?.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({c.course?.code}) • {c.semester?.name}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-medium">Total Marks: </span>
                    {c.totalMarks ?? "-"} / {c.totalMax ?? "-"}
                  </div>
                  <div>
                    <span className="font-medium">Overall %: </span>
                    {c.percentage != null ? `${c.percentage}%` : "-"}
                  </div>
                </div>

                {c.exams.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No exams recorded for this course yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Max</TableHead>
                          <TableHead>Marks</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {c.exams.map((ex) => (
                          <TableRow key={ex.examId}>
                            <TableCell>{ex.title}</TableCell>
                            <TableCell>{ex.type}</TableCell>
                            <TableCell className="text-xs">
                              {ex.examDate
                                ? new Date(ex.examDate).toLocaleDateString()
                                : "-"}
                            </TableCell>
                            <TableCell>{ex.maxMarks}</TableCell>
                            <TableCell>
                              {ex.marks != null ? ex.marks : "-"}
                            </TableCell>
                            <TableCell>{ex.grade || "-"}</TableCell>
                            <TableCell className="text-xs">
                              {ex.status || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
