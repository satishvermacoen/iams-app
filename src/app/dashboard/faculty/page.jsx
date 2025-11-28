// src/app/dashboard/faculty/page.jsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useFacultyOfferingsMe } from "@/hooks/useFacultyOfferingsMe";

export default function FacultyDashboardPage() {
  const { data, isLoading } = useFacultyOfferingsMe();

  const myCourses = data?.items || [];
  const todaySessions = data?.todaySessions || [];
  const upcomingExams = data?.upcomingExams || [];

  const router = useRouter();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Faculty</span>
      </nav>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage attendance, exams, and student performance.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/faculty/timetable")}>View My Timetable</Button>
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
            <p className="text-3xl font-bold">{upcomingExams.length}</p>
            <p className="text-xs text-muted-foreground">
              Exams/assignments to grade
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
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading courses...</p>
              ) : myCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses assigned.</p>
              ) : (
                myCourses.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div>
                      <p className="font-medium">
                        {c.course?.code} - {c.course?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Section {c.section}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/faculty/attendance/${c._id}`)}
                      >
                        View Students
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/faculty/offering-exams/${c._id}`)}
                      >
                        Manage Exams
                      </Button>
                    </div>
                  </div>
                ))
              )}
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
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (myCourses.length > 0) {
                      router.push(`/dashboard/faculty/attendance/${myCourses[0]._id}`);
                    }
                  }}
                  disabled={myCourses.length === 0}
                >
                  Start New Attendance Session
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/faculty/timetable")}>Go to Timetable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exam Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => {
                  if (myCourses.length > 0) {
                    router.push(`/dashboard/faculty/offering-exams/${myCourses[0]._id}`);
                  }
                }}
                disabled={myCourses.length === 0}
              >
                Create Exam
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (myCourses.length > 0) {
                    router.push(`/dashboard/faculty/offering-exams/${myCourses[0]._id}`);
                  }
                }}
                disabled={myCourses.length === 0}
              >
                Enter Marks
              </Button>
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
