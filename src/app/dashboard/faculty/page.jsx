// src/app/dashboard/faculty/page.jsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function FacultyDashboardPage() {
  // TODO: fetch from /api/courses-offered, /api/attendance/sessions, /api/exams
  const myCourses = [
    { code: "CS101", name: "Intro to Programming", section: "A" },
    { code: "CS102", name: "Data Structures", section: "B" },
  ];

  const todaySessions = [
    { course: "CS101", time: "09:00 - 10:00", section: "A" },
    { course: "CS102", time: "11:00 - 12:00", section: "B" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage attendance, exams, and student performance.
          </p>
        </div>
        <Button variant="outline">View My Profile</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Courses This Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{myCourses.length}</p>
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
            <CardTitle>Pending Evaluation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">
              Exams/assignments to grade (placeholder)
            </p>
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
              {myCourses.map((c) => (
                <div
                  key={c.code + c.section}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <p className="font-medium">
                      {c.code} - {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Section {c.section}
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
              <CardTitle>Quick Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Integrate this with <code>/api/attendance/sessions</code> and{" "}
                <code>/api/attendance/records</code>.
              </p>
              <Button>Start New Attendance Session</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button>Create Exam</Button>
              <Button variant="outline">Enter Marks</Button>
              <p className="text-xs text-muted-foreground">
                Use <code>/api/exams</code> and <code>/api/exams/results</code> for data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
