"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StudentEnrollmentsPage() {
  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TODO: Show current course enrollments with schedule and status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
