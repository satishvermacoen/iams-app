// src/app/dashboard/admin/admissions/[id]/create-student/page.jsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateStudentFromAdmissionPage() {
  const params = useParams();
  const router = useRouter();
  const admissionId = params.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admission-detail", admissionId],
    queryFn: () => apiGet(`/api/admissions/${admissionId}`),
  });

  const app = data?.item;

  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrMsg("");
    setResult(null);
    setSubmitting(true);

    try {
      const res = await fetch(
        `/api/admissions/${admissionId}/create-student`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentNo }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to create student");
      }
      setResult(data);
    } catch (err) {
      console.error("Create student from admission error:", err);
      setErrMsg(err.message || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← Back
      </Button>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>
              Review application info before creating the student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading application...
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">
                {error.message || "Failed to load application"}
              </p>
            ) : !app ? (
              <p className="text-sm text-muted-foreground">
                Application not found.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Applicant:</span>{" "}
                  {app.applicantName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {app.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {app.phone}
                </p>
                <p>
                  <span className="font-medium">Program:</span>{" "}
                  {app.program?.name} ({app.program?.code})
                </p>
                <p>
                  <span className="font-medium">Status:</span> {app.status}
                </p>
                {app.linkedStudent && (
                  <p className="text-xs text-emerald-600">
                    Already linked to student: {app.linkedStudent}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Student</CardTitle>
            <CardDescription>
              This will create a Student record and link it with this admission.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Applicant:</span>{" "}
                  {app?.applicantName || "-"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {app?.email || "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  A user account will be created for this email if not already
                  present (role: STUDENT).
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="enrollmentNo"
                  className="text-sm font-medium"
                >
                  Enrollment Number
                </label>
                <Input
                  id="enrollmentNo"
                  required
                  value={enrollmentNo}
                  onChange={(e) => setEnrollmentNo(e.target.value)}
                  placeholder="e.g., 2025-CS-001"
                />
                <p className="text-xs text-muted-foreground">
                  Define your institute’s enrollment number format (year / program code / serial).
                </p>
              </div>

              {errMsg && (
                <p className="text-sm text-red-500">{errMsg}</p>
              )}

              {result && (
                <div className="space-y-2 rounded-md border p-3 text-xs">
                  <p className="font-medium text-emerald-600">
                    {result.message}
                  </p>
                  {result.student && (
                    <p>
                      <span className="font-medium">Student ID:</span>{" "}
                      {result.student._id}
                    </p>
                  )}
                  {result.user && (
                    <p>
                      <span className="font-medium">User:</span>{" "}
                      {result.user.fullName} ({result.user.email})
                    </p>
                  )}
                  {result.generatedPassword && (
                    <p className="text-amber-600">
                      <span className="font-medium">Generated Password:</span>{" "}
                      {result.generatedPassword}
                      <br />
                      Share this with the student securely and ask them to change it after first login.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/admin/admissions")
                }
              >
                Back to Admissions
              </Button>
              <Button
                type="submit"
                disabled={submitting || !app || app.status !== "APPROVED"}
              >
                {submitting ? "Creating..." : "Create Student"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
