// src/app/dashboard/admin/students/page.jsx
"use client";

import { useMemo, useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export default function AdminStudentsPage() {
  const { data, isLoading, error } = useStudents();
  const [search, setSearch] = useState("");

  const items = data?.items || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return items;

    const s = search.trim().toLowerCase();
    return items.filter((st) => {
      const name = st.user?.fullName?.toLowerCase() || "";
      const email = st.user?.email?.toLowerCase() || "";
      const enroll = (st.enrollmentNo || "").toLowerCase();
      const program = st.program?.name?.toLowerCase() || "";
      return (
        name.includes(s) ||
        email.includes(s) ||
        enroll.includes(s) ||
        program.includes(s)
      );
    });
  }, [items, search]);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Students</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Student List</CardTitle>
          <Input
            className="max-w-xs"
            placeholder="Search by name, email, enrollment, program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading students...
            </p>
          ) : error ? (
            <p className="text-sm text-red-500">
              {error.message || "Failed to load students"}
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enrollment No</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((st) => (
                    <TableRow key={st._id}>
                      <TableCell className="font-medium">
                        {st.enrollmentNo}
                      </TableCell>
                      <TableCell>{st.user?.fullName}</TableCell>
                      <TableCell>{st.user?.email}</TableCell>
                      <TableCell>{st.program?.name}</TableCell>
                      <TableCell>{st.currentSemester?.name}</TableCell>
                      <TableCell>{st.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
