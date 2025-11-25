// src/app/dashboard/student/my-timetable/page.jsx
"use client";

import { useMyEnrollments } from "@/hooks/useStudentEnrollments";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StudentTimetablePage() {
  const { data, isLoading, error } = useMyEnrollments();
  const enrollments = data?.enrollments || [];
  const student = data?.student;

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Weekly schedule based on your current course enrollments.
        </p>
        {student && (
          <p className="mt-1 text-xs text-muted-foreground">
            Program: {student.program?.name} • Semester:{" "}
            {student.currentSemester?.name}
          </p>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Loading timetable...
        </p>
      ) : error ? (
        <p className="text-sm text-red-500">
          {error.message || "Failed to load timetable"}
        </p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You are not enrolled in any courses.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((en) => {
            const off = en.offering || {};
            const course = off.course || {};
            const faculty = off.faculty || {};
            const user = faculty.user || {};
            return (
              <Card key={en._id}>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {course.courseName || "Course"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {course.courseCode || ""} • Section {off.section || "-"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p>
                    <span className="font-medium">Faculty: </span>
                    {user.fullName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Schedule: </span>
                    {off.scheduleText || "Schedule not set"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
