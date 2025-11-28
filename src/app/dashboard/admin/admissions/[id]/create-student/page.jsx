"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminCreateStudentFromAdmissionPage() {
  const params = useParams();
  const router = useRouter();
  const admissionId = params?.id;

  return (
    <div className="p-4 md:p-8 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Student</h1>
          <p className="text-sm text-muted-foreground">
            From admission application ID: {admissionId}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/admin/admissions")}>Back to Admissions</Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            TODO: Implement the form to create a student from this admission application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
