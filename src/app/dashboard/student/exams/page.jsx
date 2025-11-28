"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StudentExamsPage() {
  return (
    <div className="p-4 md:p-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Exams & Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TODO: List upcoming exams and show results history.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
