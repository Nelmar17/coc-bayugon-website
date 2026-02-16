"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { deleteCloudinary } from "@/lib/deleteCloudinary";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UploadButton from "@/components/UploadButton";

type PreachingActivityType =
  | "gospel_meeting"
  | "midweek_service"
  | "sunday_service"
  | "visitation"
  | "mission_trip"
  | "youth_service"
  | "special_event";

type PreachingActivity = {
  id: number;
  title: string;
  type: PreachingActivityType;

  preacher: string;
  description?: string | null;
  outline?: string | null;
  content?: string | null;

  congregation?: string | null;
  location: string;
  address?: string | null;

  startDate: string;
  endDate?: string | null;

  scheduleId?: number | null;
  eventId?: number | null;

  coverImageUrl?: string | null;
  coverImageId?: string | null;

  gallery: string[];
  galleryIds: string[];

  createdAt?: string | null;
};

type SelectOpt = { id: number; label: string };

type FormState = {
  title: string;
  type: PreachingActivityType;

  preacher: string;
  description: string;
  outline: string;
  content: string;

  congregation: string;
  location: string;
  address: string;

  startDate: string; // datetime-local
  endDate: string;   // datetime-local optional

  scheduleId: string; // keep as string for select
  eventId: string;

  coverImageUrl: string;
  coverImageId: string;

  gallery: string[];
  galleryIds: string[];
};

const emptyForm: FormState = {
  title: "",
  type: "gospel_meeting",

  preacher: "",
  description: "",
  outline: "",
  content: "",

  congregation: "",
  location: "",
  address: "",

  startDate: "",
  endDate: "",

  scheduleId: "",
  eventId: "",

  coverImageUrl: "",
  coverImageId: "",

  gallery: [],
  galleryIds: [],
};

function isoToDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToISO(v: string) {
  return new Date(v).toISOString();
}

// async function deleteCloudinary(publicId: string) {
//   const res = await fetch("/api/cloudinary/delete", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ publicId }),
//   });
//   if (!res.ok) {
//     const t = await res.text();
//     throw new Error(t || "Failed to delete file");
//   }
// }

function typeLabel(t: PreachingActivityType) {
  const map: Record<PreachingActivityType, string> = {
    gospel_meeting: "Gospel Meeting",
    midweek_service: "Midweek Service",
    sunday_service: "Sunday Service",
    visitation: "Visitation",
    mission_trip: "Mission Trip",
    youth_service: "Youth Service",
    special_event: "Special Event",
  };
  return map[t];
}

export default function AdminPreachingActivitiesPage() {
  const [items, setItems] = useState<PreachingActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PreachingActivity | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // optional selectors
  const [scheduleOptions, setScheduleOptions] = useState<SelectOpt[]>([]);
  const [eventOptions, setEventOptions] = useState<SelectOpt[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<PreachingActivity | null>(null);

  const [deleting, setDeleting] = useState(false);



  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/preaching-activities", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as PreachingActivity[];
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Preaching Activities");
    } finally {
      setLoading(false);
    }
  }

  async function loadSelectors() {
    // ✅ safe: ignore errors (optional lang)
    try {
      const s = await fetch("/api/schedules", { cache: "no-store" });
      if (s.ok) {
        const data = await s.json();
        // expected: Schedule[] (id, day, time, serviceName, title?)
        const opts: SelectOpt[] = (Array.isArray(data) ? data : []).map((x: any) => ({
          id: x.id,
          label: x.title
            ? `${x.title}`
            : `${x.day ?? ""} ${x.time ?? ""} • ${x.serviceName ?? "Schedule"}`.trim(),
        }));
        setScheduleOptions(opts);
      }
    } catch {}

    try {
      const e = await fetch("/api/events", { cache: "no-store" });
      if (e.ok) {
        const data = await e.json();
        const opts: SelectOpt[] = (Array.isArray(data) ? data : []).map((x: any) => ({
          id: x.id,
          label: x.title ?? `Event #${x.id}`,
        }));
        setEventOptions(opts);
      }
    } catch {}
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
    loadSelectors();
  }

  function openEdit(item: PreachingActivity) {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      type: item.type,

      preacher: item.preacher ?? "",
      description: item.description ?? "",
      outline: item.outline ?? "",
      content: item.content ?? "",

      congregation: item.congregation ?? "",
      location: item.location ?? "",
      address: item.address ?? "",

      startDate: isoToDatetimeLocal(item.startDate),
      endDate: isoToDatetimeLocal(item.endDate ?? null),

      scheduleId: item.scheduleId ? String(item.scheduleId) : "",
      eventId: item.eventId ? String(item.eventId) : "",

      coverImageUrl: item.coverImageUrl ?? "",
      coverImageId: item.coverImageId ?? "",

      gallery: item.gallery ?? [],
      galleryIds: item.galleryIds ?? [],
    });
    setDialogOpen(true);
    loadSelectors();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.preacher.trim()) return toast.error("Preacher is required");
    if (!form.location.trim()) return toast.error("Location is required");
    if (!form.startDate) return toast.error("Start Date & Time is required");

    setSaving(true);

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `/api/preaching-activities/${editing.id}`
        : "/api/preaching-activities";

      const payload = {
        title: form.title,
        type: form.type,

        preacher: form.preacher,
        description: form.description || null,
        outline: form.outline || null,
        content: form.content || null,

        congregation: form.congregation || null,
        location: form.location,
        address: form.address || null,

        startDate: datetimeLocalToISO(form.startDate),
        endDate: form.endDate ? datetimeLocalToISO(form.endDate) : null,

        scheduleId: form.scheduleId ? Number(form.scheduleId) : null,
        eventId: form.eventId ? Number(form.eventId) : null,

        coverImageUrl: form.coverImageUrl || null,
        coverImageId: form.coverImageId || null,

        gallery: form.gallery,
        galleryIds: form.galleryIds,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error(t);
        toast.error("Failed to save activity");
        return;
      }

      toast.success(editing ? "Updated activity" : "Created activity");
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Error saving activity");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting activity...");

    try {
      const res = await fetch(
        `/api/preaching-activities/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("Preaching activity deleted", { id: toastId });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete activity", { id: toastId });
    } finally {
      setDeleting(false);
    }
  }


  // ✅ Cover remove
async function removeCover() {
  if (!form.coverImageId) return;

  try {
    await deleteCloudinary(form.coverImageId, "image");

    setForm((f) => ({
      ...f,
      coverImageId: "",
      coverImageUrl: "",
    }));

    toast.success("Cover image removed");
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove cover image");
  }
}


  // ✅ Gallery remove
  // ✅ Gallery remove
async function removeGalleryIndex(idx: number) {
  const pid = form.galleryIds[idx];
  if (!pid) return;

  try {
    // 🔥 GALLERY IMAGES ARE ALWAYS "image"
    await deleteCloudinary(pid, "image");

    setForm((f) => {
      const gallery = [...f.gallery];
      const galleryIds = [...f.galleryIds];
      gallery.splice(idx, 1);
      galleryIds.splice(idx, 1);
      return { ...f, gallery, galleryIds };
    });

    toast.success("Removed gallery image");
  } catch (e) {
    console.error(e);
    toast.error("Failed to remove gallery image");
  }
}


  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Preaching Activities</h2>
          <p className="text-sm text-slate-500">
            Gospel meetings, visits, missions, and outreach activities.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Activity</Button>
          </DialogTrigger>

          {/* Full-screen modal on mobile + scroll like Bible Study */}
          <DialogContent className="w-full h-[100dvh] max-w-none rounded-none md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Preaching Activity" : "Add Preaching Activity"}
              </DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the details of this Activity."
                  : "Fill out the form to add a new Activity."}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Title */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PreachingActivityType }))}
                >
                  {(
                    [
                      "gospel_meeting",
                      "midweek_service",
                      "sunday_service",
                      "visitation",
                      "mission_trip",
                      "youth_service",
                      "special_event",
                    ] as PreachingActivityType[]
                  ).map((t) => (
                    <option key={t} value={t}>
                      {typeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preacher */}
              <div className="space-y-2">
                <Label>Preacher(s)</Label>
                <Input
                  value={form.preacher}
                  onChange={(e) => setForm((f) => ({ ...f, preacher: e.target.value }))}
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>

              {/* Location fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Congregation (optional)</Label>
                  <Input
                    value={form.congregation}
                    onChange={(e) => setForm((f) => ({ ...f, congregation: e.target.value }))}
                    placeholder="e.g., Church of Christ – Bayugon"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="City / Province"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address (optional)</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Exact address / venue"
                />
              </div>

              {/* Auto-link selectors */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Link to Schedule (optional)</Label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.scheduleId}
                    onChange={(e) => setForm((f) => ({ ...f, scheduleId: e.target.value }))}
                  >
                    <option value="">— None —</option>
                    {scheduleOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    Auto-link kapag itong activity ay part ng schedule.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Link to Event (optional)</Label>
                  <select
                    className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={form.eventId}
                    onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                  >
                    <option value="">— None —</option>
                    {eventOptions.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500">
                    Useful for Gospel Meeting events (connected to Event).
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short summary for cards…"
                />
              </div>

              {/* Outline markdown */}
              <div className="space-y-2">
                <Label>Outline (Markdown, optional)</Label>
                <Textarea
                  rows={6}
                  value={form.outline}
                  onChange={(e) => setForm((f) => ({ ...f, outline: e.target.value }))}
                  placeholder={`## Main Points\n- Point 1\n- Point 2\n\n## Scriptures\n- John 3:16`}
                />
                <p className="text-xs text-slate-500">
                  Supports Markdown. Headings (##) become collapsible on public page.
                </p>
              </div>

              {/* Content markdown */}
              <div className="space-y-2">
                <Label>Content (Markdown, optional)</Label>
                <Textarea
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Full report / narrative…"
                />
              </div>

              {/* Cover Image (preview like Bible Study) */}
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Cover Image</p>
                    <p className="text-xs text-slate-500">Main photo for timeline card</p>
                  </div>
                  <UploadButton
                    label="Upload Cover"
                    accept="image/*"
                    type="image"
                    onUploaded={(d) =>
                      setForm((f) => ({ ...f, coverImageUrl: d.url, coverImageId: d.public_id }))
                    }
                  />
                </div>

                {form.coverImageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={form.coverImageUrl}
                      alt="Cover"
                      className="w-full max-h-64 object-cover rounded-lg border"
                    />
                    <div className="flex justify-end">
                      <Button type="button" variant="destructive" size="sm" onClick={removeCover}>
                        Remove Cover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No cover uploaded yet.</p>
                )}
              </div>

              {/* Gallery (preview grid + remove) */}
              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Gallery</p>
                    <p className="text-xs text-slate-500">
                      Upload multiple images (click upload repeatedly)
                    </p>
                  </div>

                  <UploadButton
                    label="Add Gallery Image"
                    accept="image/*"
                    type="image"
                    onUploaded={(d) =>
                      setForm((f) => ({
                        ...f,
                        gallery: [...f.gallery, d.url],
                        galleryIds: [...f.galleryIds, d.public_id],
                      }))
                    }
                  />
                </div>

                {form.gallery.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.gallery.map((url, idx) => (
                      <div key={url + idx} className="space-y-2">
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-28 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => removeGalleryIndex(idx)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No gallery images yet.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditing(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
        </CardHeader>
        <CardContent>


           {/* ================= MOBILE VIEW ================= */}
            {!loading && sortedItems.length > 0 && (
              <div className="md:hidden space-y-4">
                {sortedItems.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="space-y-2 py-6 text-sm">
                      <div className="font-bold">{a.title}</div>

                      <div className="text-xs text-slate-500">
                        {typeLabel(a.type)}
                      </div>

                      <div>
                        <span className="font-medium">Preacher:</span>{" "}
                        {a.preacher}
                      </div>

                      <div className="text-xs text-slate-600">
                        {format(new Date(a.startDate), "MMM d, yyyy • h:mm a")}
                        {a.endDate
                          ? ` — ${format(new Date(a.endDate), "MMM d, yyyy • h:mm a")}`
                          : ""}
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(a)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          // onClick={() => handleDelete(a.id)}
                          onClick={() => setDeleteTarget(a)}
                          disabled={deleting && deleteTarget?.id === a.id}
                          // disabled={deletingId === a.id}
                        >
                          {deletingId === a.id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                   ))}
                </div>
              )}
              
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : sortedItems.length === 0 ? (
            <p className="text-sm text-slate-500">No activities yet.</p>
          ) : (

          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Preacher</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="text-right w-[180px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-xs">{typeLabel(a.type)}</TableCell>
                    <TableCell>{a.preacher}</TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {format(new Date(a.startDate), "MMM d, yyyy • h:mm a")}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {a.endDate ? format(new Date(a.endDate), "MMM d, yyyy • h:mm a") : "-"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        // onClick={() => handleDelete(a.id)}
                        onClick={() => setDeleteTarget(a)}
                        disabled={deleting && deleteTarget?.id === a.id}
                        // disabled={deletingId === a.id}
                      >
                        {deletingId === a.id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
        <ConfirmDeleteDialog
          open={!!deleteTarget}
          loading={deleting}
          title="Delete preaching activity?"
          description="This will permanently remove the activity and all its images."
          destructiveLabel={
            deleteTarget
              ? `${deleteTarget.title} • ${typeLabel(deleteTarget.type)}`
              : undefined
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}
