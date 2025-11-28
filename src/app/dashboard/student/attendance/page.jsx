"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StudentAttendancePage() {
  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TODO: Show attendance summary and detailed records per course.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
