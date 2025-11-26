"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import {
    useCourseOfferingsAdmin,
    useCreateOffering,
    useUpdateOffering,
    useDeleteOffering,
} from "@/hooks/useCourseOfferingsAdmin";
import { useSemestersAdmin } from "@/hooks/useSemesters";
import { useFacultyList } from "@/hooks/useFacultyList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";

export default function CourseOfferingsPage() {
    const [filters, setFilters] = useState({
        programId: "",
        semesterId: "",
        search: "",
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const { data: offeringsData, isLoading } = useCourseOfferingsAdmin(filters);
    const { data: semestersData } = useSemestersAdmin();
    const { data: facultyData } = useFacultyList();

    // Fetch Programs and Courses directly here for now
    const { data: programsData } = useQuery({
        queryKey: ["programs"],
        queryFn: () => apiGet("/api/programs"),
    });

    const { data: coursesData } = useQuery({
        queryKey: ["courses", filters.programId], // Refetch when program changes if needed, but for now fetch all or filter client side
        queryFn: () => apiGet(filters.programId ? `/api/courses?programId=${filters.programId}` : "/api/courses"),
        enabled: true,
    });

    const createMutation = useCreateOffering();
    const updateMutation = useUpdateOffering();
    const deleteMutation = useDeleteOffering();

    const handleSave = async (data) => {
        try {
            if (editingItem) {
                await updateMutation.mutateAsync({ id: editingItem._id, ...data });
                toast.success("Offering updated successfully");
            } else {
                await createMutation.mutateAsync(data);
                toast.success("Offering created successfully");
            }
            setIsDialogOpen(false);
            setEditingItem(null);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this offering?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Offering deleted");
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openCreate = () => {
        setEditingItem(null);
        setIsDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Course Offerings</h1>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Offering
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-end bg-card p-4 rounded-lg border">
                <div className="space-y-2 w-1/4">
                    <Label>Program</Label>
                    <Select
                        value={filters.programId}
                        onValueChange={(val) => setFilters({ ...filters, programId: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Programs" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Programs</SelectItem>
                            {programsData?.items?.map((p) => (
                                <SelectItem key={p._id} value={p._id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-1/4">
                    <Label>Semester</Label>
                    <Select
                        value={filters.semesterId}
                        onValueChange={(val) => setFilters({ ...filters, semesterId: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Semesters</SelectItem>
                            {semestersData?.items
                                ?.filter(
                                    (s) =>
                                        !filters.programId ||
                                        filters.programId === "ALL" ||
                                        s.program === filters.programId
                                )
                                .map((s) => (
                                    <SelectItem key={s._id} value={s._id}>
                                        {s.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-1/4">
                    <Label>Search</Label>
                    <Input
                        placeholder="Search course..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setFilters({ programId: "", semesterId: "", search: "" })}
                >
                    Reset
                </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Schedule</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : offeringsData?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">
                                    No offerings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            offeringsData?.items?.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>
                                        <div className="font-medium">{item.course?.courseName}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {item.course?.courseCode}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.semester?.name}</TableCell>
                                    <TableCell>{item.section}</TableCell>
                                    <TableCell>
                                        {item.faculty?.user?.fullName || "Unassigned"}
                                    </TableCell>
                                    <TableCell>
                                        {item.schedule?.map((s, i) => (
                                            <div key={i} className="text-xs">
                                                {s.day} {s.startTime}-{s.endTime} ({s.room})
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>{item.maxCapacity}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEdit(item)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => handleDelete(item._id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <OfferingDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={editingItem}
                onSave={handleSave}
                courses={coursesData?.items || []}
                semesters={semestersData?.items || []}
                faculty={facultyData?.items || []}
            />
        </div>
    );
}

function OfferingDialog({
    open,
    onOpenChange,
    initialData,
    onSave,
    courses,
    semesters,
    faculty,
}) {
    const [formData, setFormData] = useState({
        courseId: "",
        semesterId: "",
        facultyId: "",
        section: "A",
        year: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
        maxCapacity: 60,
        schedule: [],
    });

    // Reset form when opening
    useQuery({
        queryKey: ["reset-form", initialData],
        queryFn: () => {
            if (initialData) {
                setFormData({
                    courseId: initialData.course?._id,
                    semesterId: initialData.semester?._id,
                    facultyId: initialData.faculty?._id,
                    section: initialData.section,
                    year: initialData.year,
                    maxCapacity: initialData.maxCapacity,
                    schedule: initialData.schedule || [],
                });
            } else {
                setFormData({
                    courseId: "",
                    semesterId: "",
                    facultyId: "",
                    section: "A",
                    year: new Date().getFullYear().toString() + "-" + (new Date().getFullYear() + 1).toString(),
                    maxCapacity: 60,
                    schedule: [],
                });
            }
            return null;
        },
        enabled: open
    });


    const addScheduleSlot = () => {
        setFormData({
            ...formData,
            schedule: [
                ...formData.schedule,
                { day: "MON", startTime: "09:00", endTime: "10:00", room: "" },
            ],
        });
    };

    const removeScheduleSlot = (index) => {
        const newSchedule = [...formData.schedule];
        newSchedule.splice(index, 1);
        setFormData({ ...formData, schedule: newSchedule });
    };

    const updateScheduleSlot = (index, field, value) => {
        const newSchedule = [...formData.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setFormData({ ...formData, schedule: newSchedule });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Offering" : "Create Offering"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Course</Label>
                            <Select
                                value={formData.courseId}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, courseId: val })
                                }
                                disabled={!!initialData} // Can't change course on edit usually
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c._id} value={c._id}>
                                            {c.courseName} ({c.courseCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select
                                value={formData.semesterId}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, semesterId: val })
                                }
                                disabled={!!initialData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Semester" />
                                </SelectTrigger>
                                <SelectContent>
                                    {semesters.map((s) => (
                                        <SelectItem key={s._id} value={s._id}>
                                            {s.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Faculty</Label>
                            <Select
                                value={formData.facultyId}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, facultyId: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Faculty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {faculty.map((f) => (
                                        <SelectItem key={f._id} value={f._id}>
                                            {f.user?.fullName} ({f.department?.name})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Section</Label>
                            <Input
                                value={formData.section}
                                onChange={(e) =>
                                    setFormData({ ...formData, section: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Academic Year</Label>
                            <Input
                                value={formData.year}
                                onChange={(e) =>
                                    setFormData({ ...formData, year: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Capacity</Label>
                            <Input
                                type="number"
                                value={formData.maxCapacity}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label>Schedule</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
                                <Plus className="h-3 w-3 mr-1" /> Add Slot
                            </Button>
                        </div>
                        <div className="space-y-2 border p-2 rounded bg-muted/20">
                            {formData.schedule.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-2">
                                    No schedule slots added.
                                </div>
                            )}
                            {formData.schedule.map((slot, index) => (
                                <div key={index} className="flex gap-2 items-end">
                                    <div className="w-24">
                                        <Label className="text-xs">Day</Label>
                                        <Select
                                            value={slot.day}
                                            onValueChange={(val) => updateScheduleSlot(index, "day", val)}
                                        >
                                            <SelectTrigger className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                                                    <SelectItem key={d} value={d}>
                                                        {d}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <Label className="text-xs">Start</Label>
                                        <Input
                                            className="h-8"
                                            type="time"
                                            value={slot.startTime}
                                            onChange={(e) => updateScheduleSlot(index, "startTime", e.target.value)}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <Label className="text-xs">End</Label>
                                        <Input
                                            className="h-8"
                                            type="time"
                                            value={slot.endTime}
                                            onChange={(e) => updateScheduleSlot(index, "endTime", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs">Room</Label>
                                        <Input
                                            className="h-8"
                                            value={slot.room}
                                            onChange={(e) => updateScheduleSlot(index, "room", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => removeScheduleSlot(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save Offering</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
