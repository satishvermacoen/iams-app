// src/app/dashboard/faculty/offering-exams/[offeringId]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFacultyExams, useCreateExam, useDeleteExam } from "@/hooks/useFacultyExams";
import { useExamResults, useSaveExamResults } from "@/hooks/useExamResults";
import { apiGet } from "@/lib/api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

function formatDateInputValue(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function OfferingExamsPage() {
  const params = useParams();
  const router = useRouter();
  const offeringId = params.offeringId;

  const { data: examsData, isLoading, error } = useFacultyExams(offeringId);
  const exams = examsData?.items || [];

  const createExam = useCreateExam();
  const deleteExam = useDeleteExam();

  const [newExam, setNewExam] = useState({
    title: "",
    type: "INTERNAL",
    examDate: formatDateInputValue(new Date()),
    maxMarks: "",
    weightage: "",
  });

  const [selectedExamId, setSelectedExamId] = useState(null);

  const {
    data: resultsData,
    isLoading: resultsLoading,
    error: resultsError,
  } = useExamResults(selectedExamId, offeringId);

  const [roster, setRoster] = useState([]);
  const [localMarks, setLocalMarks] = useState([]);
  const saveExamResults = useSaveExamResults();

  // Load roster when we pick an exam
  useEffect(() => {
    async function loadRoster() {
      if (!selectedExamId || !offeringId) {
        setRoster([]);
        setLocalMarks([]);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.set("offeringId", offeringId);
        const data = await apiGet(`/api/enrollments/by-offering?${params.toString()}`);
        const items = data.items || [];
        setRoster(items);
      } catch (err) {
        console.error("Load roster error:", err);
      }
    }
    loadRoster();
  }, [selectedExamId, offeringId]);

  // Sync marks from API + roster into local state
  useEffect(() => {
    if (!selectedExamId || roster.length === 0) {
      setLocalMarks([]);
      return;
    }
    const records = resultsData?.records || [];
    const recordMap = new Map(
      records.map((r) => [String(r.enrollmentId), r])
    );
    setLocalMarks(
      roster.map((st) => {
        const rec = recordMap.get(String(st.enrollmentId));
        return {
          enrollmentId: st.enrollmentId,
          fullName: st.fullName,
          enrollmentNo: st.enrollmentNo,
          email: st.email,
          marks: rec?.marks ?? "",
          grade: rec?.grade ?? "",
          status: rec?.status || "PRESENT",
        };
      })
    );
  }, [resultsData, roster, selectedExamId]);

  async function handleCreateExam(e) {
    e.preventDefault();
    if (!newExam.title || !newExam.examDate || !newExam.maxMarks) return;
    try {
      await createExam.mutateAsync({
        offeringId,
        title: newExam.title,
        type: newExam.type,
        examDate: newExam.examDate,
        maxMarks: Number(newExam.maxMarks),
        weightage: newExam.weightage ? Number(newExam.weightage) : undefined,
      });
      setNewExam({
        title: "",
        type: "INTERNAL",
        examDate: formatDateInputValue(new Date()),
        maxMarks: "",
        weightage: "",
      });
    } catch (err) {
      console.error("Create exam error:", err);
      alert(err.message || "Failed to create exam");
    }
  }

  async function handleDeleteExamClick(examId) {
    if (!confirm("Delete this exam?")) return;
    try {
      await deleteExam.mutateAsync({ examId, offeringId });
      if (selectedExamId === examId) {
        setSelectedExamId(null);
      }
    } catch (err) {
      console.error("Delete exam error:", err);
      alert(err.message || "Failed to delete exam");
    }
  }

  async function handleSaveMarks() {
    if (!selectedExamId) return;
    try {
      await saveExamResults.mutateAsync({
        examId: selectedExamId,
        offeringId,
        records: localMarks.map((m) => ({
          enrollmentId: m.enrollmentId,
          marks:
            m.marks === "" || m.marks === null
              ? null
              : Number(m.marks),
          grade: m.grade || "",
          status: m.status || "PRESENT",
        })),
      });
      alert("Marks saved");
    } catch (err) {
      console.error("Save marks error:", err);
      alert(err.message || "Failed to save marks");
    }
  }

  function updateLocalMark(enrollmentId, field, value) {
    setLocalMarks((prev) =>
      prev.map((m) =>
        m.enrollmentId === enrollmentId
          ? { ...m, [field]: value }
          : m
      )
    );
  }

  const selectedExam = exams.find((ex) => ex._id === selectedExamId);

  return (
    <div className="p-4 md:p-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Exams & Marks Entry</h1>
          <p className="text-sm text-muted-foreground">
            Offering ID: {offeringId}
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {/* Exams list + create form */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Exams for this Offering</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading exams...
              </p>
            ) : error ? (
              <p className="text-sm text-red-500">
                {error.message || "Failed to load exams"}
              </p>
            ) : exams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No exams created yet.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {exams.map((ex) => (
                  <div
                    key={ex._id}
                    className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 ${
                      selectedExamId === ex._id
                        ? "border-primary"
                        : "border-muted"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{ex.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {ex.type} • {new Date(ex.examDate).toLocaleDateString()} •
                        Max {ex.maxMarks}
                        {ex.weightage
                          ? ` • Weightage ${ex.weightage}%`
                          : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant={
                          selectedExamId === ex._id ? "default" : "outline"
                        }
                        onClick={() => setSelectedExamId(ex._id)}
                      >
                        Enter Marks
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleDeleteExamClick(ex._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreateExam}>
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Exam Title
                </label>
                <Input
                  value={newExam.title}
                  onChange={(e) =>
                    setNewExam((x) => ({ ...x, title: e.target.value }))
                  }
                  placeholder="e.g. Midterm 1"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Type
                </label>
                <Select
                  value={newExam.type}
                  onValueChange={(value) =>
                    setNewExam((x) => ({ ...x, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERNAL">Internal</SelectItem>
                    <SelectItem value="MIDTERM">Midterm</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="PRACTICAL">Practical</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Date
                </label>
                <Input
                  type="date"
                  value={newExam.examDate}
                  onChange={(e) =>
                    setNewExam((x) => ({ ...x, examDate: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Max Marks
                </label>
                <Input
                  type="number"
                  min="0"
                  value={newExam.maxMarks}
                  onChange={(e) =>
                    setNewExam((x) => ({ ...x, maxMarks: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Weightage (%) (optional)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newExam.weightage}
                  onChange={(e) =>
                    setNewExam((x) => ({
                      ...x,
                      weightage: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={createExam.isLoading}>
                  {createExam.isLoading ? "Creating..." : "Create Exam"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Marks entry for selected exam */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedExam
              ? `Marks Entry: ${selectedExam.title}`
              : "Select an exam to enter marks"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedExam ? (
            <p className="text-sm text-muted-foreground">
              Select an exam above to view and edit marks.
            </p>
          ) : resultsLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading marks...
            </p>
          ) : resultsError ? (
            <p className="text-sm text-red-500">
              {resultsError.message || "Failed to load marks"}
            </p>
          ) : roster.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students enrolled in this offering.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Enrollment No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localMarks.map((m, idx) => (
                      <TableRow key={m.enrollmentId}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{m.enrollmentNo || "-"}</TableCell>
                        <TableCell>{m.fullName || "-"}</TableCell>
                        <TableCell className="w-24">
                          <Input
                            type="number"
                            min="0"
                            max={selectedExam.maxMarks}
                            value={m.marks}
                            onChange={(e) =>
                              updateLocalMark(
                                m.enrollmentId,
                                "marks",
                                e.target.value
                              )
                            }
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="w-24">
                          <Input
                            value={m.grade}
                            onChange={(e) =>
                              updateLocalMark(
                                m.enrollmentId,
                                "grade",
                                e.target.value
                              )
                            }
                            placeholder="A/B/C..."
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="w-28">
                          <Select
                            value={m.status}
                            onValueChange={(value) =>
                              updateLocalMark(
                                m.enrollmentId,
                                "status",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PRESENT">
                                Present
                              </SelectItem>
                              <SelectItem value="ABSENT">
                                Absent
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleSaveMarks}
                  disabled={saveExamResults.isLoading}
                >
                  {saveExamResults.isLoading ? "Saving..." : "Save Marks"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
