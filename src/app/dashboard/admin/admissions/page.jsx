// src/app/dashboard/admin/admissions/page.jsx
"use client";

import { useState } from "react";
import { useAdmissions, useUpdateAdmissionStatus } from "@/hooks/useAdmissions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function AdminAdmissionsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading, error } = useAdmissions(statusFilter || undefined);
  const updateStatus = useUpdateAdmissionStatus();

  const items = data?.items || [];

  function handleStatusChange(id, status) {
    updateStatus.mutate({ id, status });
  }

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Manage Admissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <TabsList>
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value || "all"} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={statusFilter} className="mt-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading applications...
                </p>
              ) : error ? (
                <p className="text-sm text-red-500">
                  {error.message || "Failed to load applications"}
                </p>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((app) => (
                        <TableRow key={app._id}>
                          <TableCell className="font-medium">
                            {app.applicantName}
                          </TableCell>
                          <TableCell>
                            {app.program?.name || "-"}
                          </TableCell>
                          <TableCell>{app.email}</TableCell>
                          <TableCell>{app.phone}</TableCell>
                          <TableCell>{app.status}</TableCell>
                          <TableCell>
                            {app.appliedAt
                              ? new Date(app.appliedAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={updateStatus.isLoading || app.status === "APPROVED"}
                              onClick={() =>
                                handleStatusChange(app._id, "APPROVED")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              disabled={updateStatus.isLoading || app.status === "REJECTED"}
                              onClick={() =>
                                handleStatusChange(app._id, "REJECTED")
                              }
                            >
                              Reject
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              disabled={
                                app.status !== "APPROVED" || !!app.linkedStudent
                              }
                              onClick={() =>
                                router.push(
                                  `/dashboard/admin/admissions/${app._id}/create-student`
                                )
                              }
                            >
                              Create Student
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
