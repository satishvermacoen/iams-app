// src/app/dashboard/faculty/page.jsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useFacultyDashboard } from "@/hooks/useFacultyDashboard";

export default function FacultyDashboardPage() {
  const { data, isLoading, error } = useFacultyDashboard();

  const faculty = data?.faculty;
  const offerings = data?.offerings || [];
  const todaySessions = data?.todaySessions || [];
  const upcomingExams = data?.upcomingExams || [];

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading faculty dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">
          Error: {error.message || "Failed to load dashboard"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            Faculty: {faculty?.user?.fullName || "Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Department: {faculty?.department?.name}
          </p>
        </div>
        <Button variant="outline">View Profile</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Courses This Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{offerings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todaySessions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingExams.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {offerings.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No courses assigned yet.
                </p>
              )}
              {offerings.map((o) => (
                <div
                  key={o._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <p className="font-medium">
                      {o.course?.courseCode} - {o.course?.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Section {o.section} • {o.semester?.name}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    View Students
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {todaySessions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No sessions scheduled today.
                </p>
              )}
              {todaySessions.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {s.offering?.course?.courseCode} -{" "}
                      {s.offering?.course?.courseName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Section {s.offering?.section}
                    </p>
                  </div>
                  <Button size="sm">Mark Attendance</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {upcomingExams.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No upcoming exams.
                </p>
              )}
              {upcomingExams.map((exam) => (
                <div
                  key={exam._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <p className="font-medium">
                      {exam.offering?.course?.courseCode} – {exam.examType}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(exam.examDate).toLocaleDateString()}
                  </span>
                </div>
              ))}

              <div className="pt-2 space-x-2">
                <Button size="sm">Create Exam</Button>
                <Button size="sm" variant="outline">
                  Enter Marks
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
