// src/app/dashboard/student/page.jsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function StudentDashboardPage() {
  // TODO: fetch dashboard data from /api/students/me, /api/attendance/records, /api/exams/results
  const enrolledCourses = [
    { code: "CS101", name: "Intro to Programming", attendance: "92%" },
    { code: "MA201", name: "Discrete Math", attendance: "85%" },
  ];

  const upcomingExams = [
    { course: "CS101", type: "MIDTERM", date: "2025-12-05" },
    { course: "MA201", type: "QUIZ", date: "2025-12-08" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            View your courses, attendance, and upcoming exams.
          </p>
        </div>
        <Button variant="outline">Download Transcript (soon)</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">88%</p>
            <p className="text-xs text-muted-foreground">
              Based on all enrolled courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrolledCourses.length}</p>
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
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrolledCourses.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {c.code} - {c.name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Attendance: {c.attendance}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Later connect this to <code>/api/attendance/records</code> for the logged-in student.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {upcomingExams.map((e, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span>
                      {e.course} – {e.type}
                    </span>
                    <span className="text-muted-foreground">{e.date}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
