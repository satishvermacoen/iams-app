// src/app/dashboard/faculty/timetable/page.jsx
"use client";

import { useFacultyOfferingsMe } from "@/hooks/useFacultyOfferingsMe";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function FacultyTimetablePage() {
  const { data, isLoading, error } = useFacultyOfferingsMe();
  const offerings = data?.items || [];

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Teaching Timetable</h1>
        <p className="text-sm text-muted-foreground">
          Weekly schedule based on your assigned course offerings.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading timetable...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error.message || "Failed to load timetable"}</p>
      ) : offerings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No offerings assigned yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offerings.map((off) => {
            const course = off.course || {};
            const program = off.program || {};
            const semester = off.semester || {};
            return (
              <Card key={off._id}>
                <CardHeader>
                  <CardTitle className="text-sm">{course.courseName || "Course"}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {course.courseCode || ""} • Section {off.section || "-"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-1 text-xs">
                  <p>
                    <span className="font-medium">Program: </span>
                    {program.name || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Semester: </span>
                    {semester.name || "-"}
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
