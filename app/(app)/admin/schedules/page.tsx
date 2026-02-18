"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import AdminMapPicker from "@/components/AdminMapPicker";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

/* ---------------- TYPES ---------------- */


function recurrenceBadge(r?: string | null) {
  if (!r) return null;

  let label = r;
  let className =
    "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

  if (r === "WEEKLY") {
    label = "Weekly";
    className =
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
  }

  if (r === "MONTHLY_LAST") {
    label = "Monthly (Last Week)";
    className =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }

  return (
    <span
      className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${className}`}
    >
      {label}
    </span>
  );
}


type Schedule = {
  id: number;
  title?: string;
  day: string;
  serviceName: string;
  preacher?: string;
  location?: string;

  latitude?: number | null;
  longitude?: number | null;

  eventDate?: string;
  endDate?: string;
  recurrence?: string | null;
};


/* ---------------- VALIDATION ---------------- */

// Zod validation schema
// const scheduleSchema = z.object({
//   title: z.string().optional(),
//   day: z.string().min(1, "Day is required"),
//   // time: z.string().min(1, "Time is required"),
//   serviceName: z.string().min(1, "Service name is required"),
//   recurrence: z.string().max(50).optional(),
//   preacher: z.string().optional(),
//   location: z.string().optional(),
//   eventDate: z
//     .string()
//     .min(1, "Event date/time is required")
//     .refine((val) => !Number.isNaN(Date.parse(val)), {
//       message: "Invalid date/time",
//     }),
//   endDate: z.string().optional(),
// });

const scheduleSchema = z
  .object({
    title: z.string().optional(),
    day: z.string().min(1),
    serviceName: z.string().min(1),
    preacher: z.string().optional(),
    location: z.string().optional(),

    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),

    recurrence: z.string().optional(),
    eventDate: z.string(),
    endDate: z.string().optional(),
  })
 .refine(
  (data) =>
    (data.latitude === null && data.longitude === null) ||
    (data.latitude !== null && data.longitude !== null),
  {
    message: "Latitude and longitude must both be set",
    path: ["latitude"],
  }
)


type FormState = z.infer<typeof scheduleSchema>;


const emptySchedule: FormState = {
  title: "",
  day: "",
  serviceName: "",
  preacher: "",
  location: "",
  latitude: null,
  longitude: null,
  eventDate: "",
  endDate: "",
  recurrence: "",
};


/* ---------------- COMPONENT ---------------- */

export default function AdminSchedulesPage() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState<FormState>(emptySchedule);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // const [deletingId, setDeletingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);
  const [deleting, setDeleting] = useState(false);

  // search + pagination state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/schedules", { cache: "no-store" });
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

//   async function geocodeAddress(address: string) {
//   const res = await fetch(
//     `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//       address
//     )}`
//   );
//   const data = await res.json();
//   if (!data?.length) return null;

//   return {
//     lat: parseFloat(data[0].lat),
//     lng: parseFloat(data[0].lon),
//   };
// }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptySchedule);
    setErrors({});
    setDialogOpen(true);
  }

function openEdit(item: Schedule) {
  setEditing(item);
  setErrors({});

  setForm({
    title: item.title ?? "",
    day: item.day,
    serviceName: item.serviceName,
    preacher: item.preacher ?? "",
    location: item.location ?? "",
    eventDate: isoToDatetimeLocal(item.eventDate ?? null),
    endDate: isoToDatetimeLocal(item.endDate ?? null),
    recurrence: item.recurrence ?? "",

    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
  });

  setDialogOpen(true);
}

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptySchedule);
    setErrors({});
  }

  function isoToDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// datetime-local string -> ISO (UTC). OK ito basta isoToDatetimeLocal gamit mo sa edit.
function datetimeLocalToISO(v: string) {
  return v ? new Date(v).toISOString() : "";
}
      async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        const parsed = scheduleSchema.safeParse(form);

        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const field = issue.path[0];
            if (typeof field === "string" && !fieldErrors[field]) {
              fieldErrors[field] = issue.message;
            }
          }
          setErrors(fieldErrors);
          setSaving(false);
          return;
        }
        setErrors({});

        // ✅ SAFE RECURRENCE (AFTER validation)
        // const allowed = ["", "WEEKLY", "MONTHLY_LAST"] as const;

        // const recurrence = allowed.includes(parsed.data.recurrence)
        //   ? parsed.data.recurrence
        //   : "";

        // const allowed = ["", "WEEKLY", "MONTHLY_LAST"] as const;
        // type AllowedRecurrence = (typeof allowed)[number];

        // const recurrence: AllowedRecurrence =
        //   allowed.includes((parsed.data.recurrence ?? "") as AllowedRecurrence)
        //     ? (parsed.data.recurrence ?? "") as AllowedRecurrence
        //     : "";

          const payload = {
            ...parsed.data,

            latitude: form.latitude,
            longitude: form.longitude,

            recurrence: parsed.data.recurrence?.trim() || null,
            eventDate: datetimeLocalToISO(parsed.data.eventDate),
            endDate: parsed.data.endDate
              ? datetimeLocalToISO(parsed.data.endDate)
              : null,
          };


        try {
          const method = editing ? "PUT" : "POST";
          const url = editing
            ? `/api/schedules/${editing.id}`
            : "/api/schedules";

          const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            console.error(await res.text());
            toast.error("Failed to save schedule");
            return;
          }

          toast.success(
            editing
              ? "Schedule updated successfully"
              : "Schedule created successfully"
          );

          closeDialog();
          await load();
        } catch (err) {
          console.error(err);
          toast.error("Error saving schedule");
        } finally {
          setSaving(false);
        }
      }

      async function handleDeleteConfirmed() {
        if (!deleteTarget) return;

        const id = deleteTarget.id;
        setDeleting(true);

        const toastId = toast.loading("Deleting schedule...");

        try {
          const res = await fetch(`/api/schedules/${id}`, {
            method: "DELETE",
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          toast.success("Schedule deleted", { id: toastId });
          setDeleteTarget(null);
          await load();
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete schedule", { id: toastId });
        } finally {
          setDeleting(false);
        }
      }


  // ---- search + pagination + highlighting upcoming ----

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;

    return items.filter((s) => {
      return (
        (s.title ?? "").toLowerCase().includes(q) ||
        s.serviceName.toLowerCase().includes(q) ||
        (s.preacher ?? "").toLowerCase().includes(q) ||
        (s.location ?? "").toLowerCase().includes(q) ||
        s.day.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  // find next upcoming event (based on eventDate)
  const upcomingId = useMemo(() => {
    const now = new Date();
    const upcoming = [...items]
      .filter((s) => s.eventDate)
      .sort(
        (a, b) =>
          new Date(a.eventDate as string).getTime() -
          new Date(b.eventDate as string).getTime()
      )
      .find((s) => new Date(s.eventDate as string) >= now);

    return upcoming?.id ?? null;
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header + Add button (same pattern as other admin pages) */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Schedules</h2>
          <p className="text-sm text-slate-500">
            Manage worship / Bible study schedules.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Schedule</Button>
          </DialogTrigger>

          {/* ✅ Unified dialog UX (same as Bible Studies/Sermons) */}
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Schedule" : "Add Schedule"}
              </DialogTitle>
            </DialogHeader>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* BASIC */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">
                  Details
                </h3>

                <div className="space-y-2">
                  <Label>Title / Topic</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Bible Study Topic / Lesson Title"
                    className="text-base"
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title}</p>
                  )}
                </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Event Date &amp; Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.eventDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, eventDate: e.target.value }))
                    }
                    className="text-base"
                  />
                  {errors.eventDate && (
                    <p className="text-xs text-red-500">{errors.eventDate}</p>
                  )}
                </div>


                  <div className="space-y-2">
                  <Label>End Date &amp; Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    className="text-base"
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500">{errors.endDate}</p>
                  )}
                </div> 
            </div>

                {/* 🔁 RECURRENCE */}
                        <div className="space-y-2">
                        <Label>Recurrence</Label>

                        <Input
                          list="recurrence-options"
                          placeholder="e.g. Weekly, Monthly, Quarterly"
                          value={form.recurrence || ""}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, recurrence: e.target.value }))
                          }
                        />

                        <datalist id="recurrence-options">
                          <option value="WEEKLY" />
                          <option value="MONTHLY_LAST" />
                          <option value="Quarterly" />
                          <option value="Every Friday" />
                        </datalist>

                        <p className="text-xs text-slate-500">
                          You may type a custom recurrence if not listed.
                        </p>
                      </div>


                  {/* <div className="space-y-2">
                    <Label>Recurrence</Label>
                    <select
                            value={form.recurrence}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                recurrence: e.target.value as "" | "WEEKLY" | "MONTHLY_LAST",
                              }))
                            }
                            className="border rounded-md px-3 py-2 text-sm w-full"
                            
                            >
                            <option value="">One-time schedule</option>
                            <option value="WEEKLY">Every week</option>
                            <option value="MONTHLY_LAST">Every last week of the month</option>
                          </select>

                          <p className="text-xs text-slate-500">
                            Leave as one-time if this does not repeat.
                          </p>
                        </div> */}


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Input
                      value={form.day}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, day: e.target.value }))
                      }
                      placeholder="Sunday"
                      required
                      className="text-base"
                    />
                    {errors.day && (
                      <p className="text-xs text-red-500">{errors.day}</p>
                    )}
                  </div>


                  {/* <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, time: e.target.value }))
                      }
                      required
                      className="text-base"
                    />
                    {errors.time && (
                      <p className="text-xs text-red-500">{errors.time}</p>
                    )}
                  </div> */}

                 <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input
                    value={form.serviceName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, serviceName: e.target.value }))
                    }
                    placeholder="Worship, Bible Study, etc."
                    required
                    className="text-base"
                  />
                  {errors.serviceName && (
                    <p className="text-xs text-red-500">
                      {errors.serviceName}
                    </p>
                  )}
                </div>
               </div>
                <div className="space-y-2">
                  <Label>Preacher</Label>
                  <Input
                    value={form.preacher}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, preacher: e.target.value }))
                    }
                    placeholder="Optional"
                    className="text-base"
                  />
                  {errors.preacher && (
                    <p className="text-xs text-red-500">{errors.preacher}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="Main Church / Outreach / Online"
                    className="text-base"
                  />
                  {errors.location && (
                    <p className="text-xs text-red-500">{errors.location}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={form.latitude ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            latitude: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          }))
                        }
                        placeholder="e.g. 10.2095"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        value={form.longitude ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            longitude: e.target.value
                              ? parseFloat(e.target.value)
                              : null,
                          }))
                        }
                        placeholder="e.g. 119.2346"
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Tip: Click the map or manually enter latitude / longitude.
                  </p>


                <div className="space-y-2">
                  <Label>Map Location</Label>

                  <AdminMapPicker
                    latitude={form.latitude ?? null}
                    longitude={form.longitude ?? null}
                    onChange={(lat, lng) =>
                      setForm((f) => ({
                        ...f,
                        latitude: lat,
                        longitude: lng,
                      }))
                    }
                  />
                  <p className="text-xs text-slate-500">
                    Click the map to drop a pin or drag the marker to adjust location.
                  </p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          latitude: null,
                          longitude: null,
                        }))
                      }
                    >
                      Clear pin
                    </Button>

                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving
                    ? editing
                      ? "Saving..."
                      : "Creating..."
                    : editing
                    ? "Save Changes"
                    : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-slate-600">Search:</Label>
          <Input
            className="w-full sm:max-w-xs"
            placeholder="Title, service, preacher, location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing page {currentPage} of {totalPages} ({filtered.length} items)
        </div>
      </div>

      {/* List */}
      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-700 dark:text-slate-400">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-700 dark:text-slate-400">No schedules yet.</p>
          ) : (
            <div className="space-y-4">
              {/* ✅ Mobile cards */}
              <div className="md:hidden space-y-3">
                {paginated.map((s) => {
                  const isUpcoming = s.id === upcomingId;
                  return (
                    <div
                      key={s.id}
                      className={`rounded-lg border p-4 space-y-2 ${
                        isUpcoming ? "border-emerald-300 bg-emerald-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="font-semibold">
                            {s.title || "—"}
                          </div>
                          {recurrenceBadge(s.recurrence)}
                          {isUpcoming && (
                            <div className="text-[10px] uppercase tracking-wide text-emerald-700 font-semibold">
                              Next upcoming
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 text-right">
                         {s.endDate && (
                          <span className="text-slate-500">
                            {" "}
                            –{" "}
                            {new Date(s.endDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        </div>
                      </div>

                      <div className="text-sm text-slate-700">
                        <span className="font-medium">{s.serviceName}</span>
                        <span className="text-slate-500">
                          {" "}
                            • {s.day} •{" "}
                            {new Date(s.eventDate!).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        Preacher: {s.preacher || "—"}
                      </div>
                      <div className="text-xs text-slate-600">
                        Location: {s.location || "—"}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                          Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(s)}
                            disabled={deleting && deleteTarget?.id === s.id}
                          >
                            {deleting && deleteTarget?.id === s.id ? "Deleting..." : "Delete"}
                          </Button>
                        {/* <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(s.id)}
                          disabled={deletingId === s.id}
                        >
                          {deletingId === s.id ? "Deleting..." : "Delete"}
                        </Button> */}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ✅ Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Preacher</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((s) => {
                      const isUpcoming = s.id === upcomingId;
                      return (
                        <TableRow
                          key={s.id}
                          className={isUpcoming ? "bg-emerald-50 dark:bg-slate-950" : ""}
                        >
                          <TableCell>
                            <div className="flex flex-col">
                             <span className="font-medium">{s.title || "—"}</span>
                              {recurrenceBadge(s.recurrence)}
                              
                              {isUpcoming && (
                                <span className="text-[10px] uppercase tracking-wide text-emerald-600 font-semibold">
                                  Next upcoming
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {s.eventDate
                              ? new Date(s.eventDate).toLocaleString()
                              : "—"}
                          </TableCell>
                          <TableCell>{s.day}</TableCell>
                          {/* <TableCell>{s.time}</TableCell> */}
                          <TableCell>
                            {s.eventDate
                              ? new Date(s.eventDate).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </TableCell>
                          <TableCell>{s.serviceName}</TableCell>
                          <TableCell>{s.preacher || "—"}</TableCell>
                          <TableCell>{s.location || "—"}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(s)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(s)}
                              disabled={deleting && deleteTarget?.id === s.id}
                            >
                              {deleting && deleteTarget?.id === s.id ? "Deleting..." : "Delete"}
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(s.id)}
                              disabled={deletingId === s.id}
                            >
                              {deletingId === s.id ? "Deleting..." : "Delete"}
                            </Button> */}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-slate-500">
                  Showing {paginated.length} of {filtered.length} item(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        <ConfirmDeleteDialog
          open={!!deleteTarget}
          loading={deleting}
          title="Delete schedule?"
          description="This will permanently remove this schedule."
          destructiveLabel={
            deleteTarget?.title ||
            `${deleteTarget?.serviceName} (${deleteTarget?.day})`
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}
