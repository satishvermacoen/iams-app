// src/app/dashboard/admin/page.jsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useAdminDashboard();
  const router = useRouter();

  const stats = data?.stats || {
    pendingApplications: 0,
    totalStudents: 0,
    totalFaculty: 0,
  };
  const recentApplications = data?.recentApplications || [];

  if (isLoading) {
    return (
      <div className="p-8">
        <p>Loading admin dashboard...</p>
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
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">Admin</span>
      </nav>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor admissions, students, and academic operations.
          </p>
        </div>
        <Button variant="outline">Export Reports</Button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.pendingApplications}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalFaculty}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="admissions">
        <TabsList>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="admissions" className="mt-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Button size="sm" variant="outline">
                Manage All
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {recentApplications.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No applications found.
                </p>
              )}
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <p className="font-medium">{app.applicantName}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.program?.name}
                    </p>
                  </div>
                  <span className="text-xs font-semibold">
                    {app.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Next step: connect this to <code>/api/students</code> with a table,
                filters (program, semester, status), and actions.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Later you can add charts (Recharts) for admission trends, pass
                rates, department-wise counts.
              </p>
            </CardContent>
          </Card>
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/admin/admissions")}>
  Manage Admissions
</Button>
<Button size="sm" variant="outline" onClick={() => router.push("/dashboard/admin/students")}>
  View Students
</Button>
<Button size="sm" variant="outline" onClick={() => router.push("/dashboard/admin/users/create")}>
  Create User
</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
