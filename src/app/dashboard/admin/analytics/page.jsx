// src/app/dashboard/admin/analytics/page.jsx
"use client";

import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export default function AdminAnalyticsPage() {
  const { data, isLoading, error } = useAdminAnalytics();

  const admissionsByMonth = data?.admissionsByMonth || [];
  const passRateByCourse = data?.passRateByCourse || [];
  const attendanceByCourse = data?.attendanceByCourse || [];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Analytics</h1>
        <p className="text-sm text-muted-foreground">
          High-level overview of admissions, pass rates, and attendance.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      ) : error ? (
        <p className="text-sm text-red-500">
          {error.message || "Failed to load analytics"}
        </p>
      ) : (
        <>
          {/* Admissions chart */}
          <Card>
            <CardHeader>
              <CardTitle>Admissions (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {admissionsByMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No admissions data available.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={admissionsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      name="Approved"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      name="Rejected"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      name="Pending"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Pass rate by course */}
          <Card>
            <CardHeader>
              <CardTitle>Pass Rate by Course</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {passRateByCourse.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No exam results data yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={passRateByCourse.map((c) => ({
                      ...c,
                      label: c.courseCode || c.courseName,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passRate" name="Pass %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Attendance by course */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Rate by Course</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {attendanceByCourse.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attendance records yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceByCourse.map((c) => ({
                      ...c,
                      label: c.courseCode || c.courseName,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="attendanceRate" name="Attendance %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
