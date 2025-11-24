// src/app/dashboard/student/registration/page.jsx
"use client";

import { useMemo, useState } from "react";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import {
  useMyEnrollments,
  useRegisterCourse,
  useDropCourse,
} from "@/hooks/useStudentEnrollments";
import { useAvailableOfferings } from "@/hooks/useAvailableOfferings";

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

export default function StudentRegistrationPage() {
  const [search, setSearch] = useState("");

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useStudentDashboard();

  const {
    data: enrollmentData,
    isLoading: enrollLoading,
    error: enrollError,
  } = useMyEnrollments();

  const student = dashboardData?.student || enrollmentData?.student;
  const programId = student?.program?._id;
  const semesterId = student?.currentSemester?._id;

  const {
    data: offeringsData,
    isLoading: offeringsLoading,
    error: offeringsError,
  } = useAvailableOfferings({ programId, semesterId, search });

  const registerCourse = useRegisterCourse();
  const dropCourse = useDropCourse();

  const enrollments = enrollmentData?.enrollments || [];
  const offerings = offeringsData?.items || [];

  // Build a quick lookup of offeringIds the student is already enrolled in
  const enrolledOfferingIds = useMemo(
    () =>
      new Set(
        enrollments
          .map((en) => en.offering?._id)
          .filter(Boolean)
          .map(String)
      ),
    [enrollments]
  );

  // Filter offerings that are NOT yet enrolled
  const availableOfferings = useMemo(() => {
    let list = offerings.filter(
      (off) => !enrolledOfferingIds.has(String(off._id))
    );

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((off) => {
        const code = off.course?.courseCode?.toLowerCase() || "";
        const name = off.course?.courseName?.toLowerCase() || "";
        return code.includes(s) || name.includes(s);
      });
    }

    return list;
  }, [offerings, enrolledOfferingIds, search]);

  const isLoading =
    dashboardLoading || enrollLoading || (offeringsLoading && !!programId && !!semesterId);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Course Registration</h1>
          <p className="text-sm text-muted-foreground">
            Register or drop courses for your current semester.
          </p>
          {student && (
            <p className="mt-1 text-xs text-muted-foreground">
              Program: {student.program?.name} • Semester:{" "}
              {student.currentSemester?.name}
            </p>
          )}
        </div>
      </header>

      {dashboardError && (
        <p className="text-sm text-red-500">
          {dashboardError.message || "Failed to load student info"}
        </p>
      )}
      {enrollError && (
        <p className="text-sm text-red-500">
          {enrollError.message || "Failed to load enrollments"}
        </p>
      )}
      {offeringsError && (
        <p className="text-sm text-red-500">
          {offeringsError.message || "Failed to load course offerings"}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">
          Loading registration data...
        </p>
      ) : !student ? (
        <p className="text-sm text-red-500">
          Student profile not found. Please contact admin.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Current Enrollments */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses (Current Semester)</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You are not enrolled in any courses yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((en) => (
                        <TableRow key={en._id}>
                          <TableCell>
                            {en.offering?.course?.courseName || "-"}
                          </TableCell>
                          <TableCell>
                            {en.offering?.course?.courseCode || "-"}
                          </TableCell>
                          <TableCell>{en.offering?.section || "-"}</TableCell>
                          <TableCell>
                            {en.offering?.faculty?.user?.fullName || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={dropCourse.isLoading}
                              onClick={() =>
                                dropCourse.mutate({ enrollmentId: en._id })
                              }
                            >
                              Drop
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Offerings */}
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Available Courses</CardTitle>
              <Input
                placeholder="Search by course name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
            </CardHeader>
            <CardContent>
              {!programId || !semesterId ? (
                <p className="text-sm text-muted-foreground">
                  Program or semester information missing. Ask admin to update
                  your profile.
                </p>
              ) : offeringsLoading && !offeringsData ? (
                <p className="text-sm text-muted-foreground">
                  Loading available offerings...
                </p>
              ) : availableOfferings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No more courses available for registration (or filtered out by
                  search).
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableOfferings.map((off) => (
                        <TableRow key={off._id}>
                          <TableCell>
                            {off.course?.courseName || "-"}
                          </TableCell>
                          <TableCell>
                            {off.course?.courseCode || "-"}
                          </TableCell>
                          <TableCell>{off.section || "-"}</TableCell>
                          <TableCell>
                            {off.faculty?.user?.fullName || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="xs"
                              disabled={registerCourse.isLoading}
                              onClick={() =>
                                registerCourse.mutate({
                                  offeringId: off._id,
                                })
                              }
                            >
                              Register
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
