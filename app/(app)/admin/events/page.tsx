"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import UploadButton from "@/components/UploadButton";
import { deleteCloudinary } from "@/lib/deleteCloudinary";
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

import { isoToDatetimeLocal, datetimeLocalToISO } from "@/lib/datetime";


function makeTempId() {
  return -Math.floor(Math.random() * 1_000_000_000);
}


type EventItem = {
  id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  // image?: string | null;
  eventDate: string; // ISO
  endDate?: string | null; // ISO
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  imageUrl?: string | null,
  imageId?: string | null,

};

type FormState = {
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  eventDate: string;
  endDate: string;
  isPublished: boolean;
  isFeatured: boolean;
  imageUrl: string;
  imageId: string;
};


const emptyEvent: FormState = {
  title: "",
  description: "",
  location: "",
  latitude: null,
  longitude: null,
  // image: "",
  eventDate: "",
  endDate: "",
  isPublished: true,
  isFeatured: false,
  imageUrl: "",
  imageId: "",

};

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyEvent);
  const [saving, setSaving] = useState(false);
  // const [deletingId, setDeletingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/events?all=1", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  async function removeImage() {
  if (!form.imageId) return;

  try {
    await deleteCloudinary(form.imageId, "image");

    setForm((f) => ({
      ...f,
      imageUrl: "",
      imageId: "",
    }));

    toast.success("Image removed");
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove image");
  }
}


  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyEvent);
    setDialogOpen(true);
  }

  function openEdit(item: EventItem) {
    setEditing(item);
    setForm({
      title: item.title ?? "",
      description: item.description ?? "",
      location: item.location ?? "",
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      // image: item.image ?? "",
      imageUrl: item.imageUrl ?? "",
      imageId: item.imageId ?? "",
      eventDate: isoToDatetimeLocal(item.eventDate),
      endDate: isoToDatetimeLocal(item.endDate ?? null),
      isPublished: !!item.isPublished,
      isFeatured: !!item.isFeatured,
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyEvent);
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!form.title.trim()) {
    toast.error("Title is required");
    return;
  }
  if (!form.eventDate) {
    toast.error("Event start date/time is required");
    return;
  }

  setSaving(true);

  const payload = {
    title: form.title.trim(),
    description: form.description.trim() || null,
    location: form.location.trim() || null,
    latitude: form.latitude,
    longitude: form.longitude,
    imageUrl: form.imageUrl.trim() || null,
    imageId: form.imageId.trim() || null,
    isPublished: form.isPublished,
    isFeatured: form.isFeatured,
    eventDate: datetimeLocalToISO(form.eventDate),
    endDate: form.endDate ? datetimeLocalToISO(form.endDate) : null,
  };

  const prev = items;

  try {
    // ✅ OPTIMISTIC UPDATE UI
    if (editing) {
      setItems((curr) =>
        curr.map((it) =>
          it.id === editing.id
            ? {
                ...it,
                ...payload,
                // keep ISO strings
                eventDate: payload.eventDate,
                endDate: payload.endDate,
              }
            : it
        )
      );
    } else {
      const tempId = makeTempId();
      const nowISO = new Date().toISOString();

      setItems((curr) => [
        ...curr,
        {
          id: tempId,
          ...payload,
          createdAt: nowISO,
          isPublished: payload.isPublished,
          isFeatured: payload.isFeatured,
        } as any,
      ]);
    }

    closeDialog();

    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/events/${editing.id}` : "/api/events";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to save event");
    }

    const saved = await res.json();

    // ✅ RECONCILE (replace temp item / refresh updated row)
    setItems((curr) => {
      if (editing) {
        return curr.map((it) => (it.id === editing.id ? saved : it));
      }
      // create: replace temp with real id
      const temp = curr.find((x) => x.id < 0 && x.title === payload.title);
      if (!temp) return [saved, ...curr]; // fallback
      return curr.map((it) => (it.id === temp.id ? saved : it));
    });

    toast.success(editing ? "Event updated" : "Event created");
  } catch (err) {
    console.error(err);
    // ❌ ROLLBACK
    setItems(prev);
    toast.error("Failed to save event");
  } finally {
    setSaving(false);
  }
}


  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    const id = deleteTarget.id;
    const prev = items;

    setDeleting(true);
    const toastId = toast.loading("Deleting event...");

    // ✅ optimistic remove
    setItems((curr) => curr.filter((it) => it.id !== id));

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("Event deleted", { id: toastId });
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);

      // ❌ rollback
      setItems(prev);
      toast.error("Failed to delete event", { id: toastId });
    } finally {
      setDeleting(false);
    }
  }


  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return items;
    return items.filter((e) => {
      return (
        e.title.toLowerCase().includes(q) ||
        (e.location ?? "").toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Special Events</h2>
          <p className="text-sm text-slate-500">
            Announcement-based events (poster style).
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Event</Button>
          </DialogTrigger>

          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
            </DialogHeader>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Announcement Details
                </h3>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Youth Fellowship Night"
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Event Start</Label>
                    <Input
                      type="datetime-local"
                      value={form.eventDate}
                      onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                      className="text-base"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Event End (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="text-base"
                    />
                  </div>
                </div>
             <div className="space-y-2">
               <Label>Description (optional)</Label>
                  <Textarea
                     value={form.description}
                       onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                       rows={4}
                       placeholder="Announcement text / details..."
                   />
                  </div>
                <div className="space-y-2">
                  <Label>Location (optional)</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="Bayugon / Outreach / Online"
                    className="text-base"
                  />
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
                              latitude: e.target.value ? parseFloat(e.target.value) : null,
                            }))
                          }
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
                              longitude: e.target.value ? parseFloat(e.target.value) : null,
                            }))
                          }
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
                            <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="font-medium">Poster Image</p>
                                  <p className="text-xs text-slate-500">Event announcement image</p>
                                </div>
                                <UploadButton
                                  label="Upload image"
                                  accept="image/*"
                                  type="image"
                                  onUploaded={(d) =>
                                    setForm((f) => ({
                                      ...f,
                                      imageUrl: d.url,
                                      imageId: d.public_id,
                                    }))
                                  }
                                />
                              </div>
                              {form.imageUrl ? (
                                <div className="space-y-2">
                                  <img
                                    src={form.imageUrl}
                                    className="w-full max-h-64 object-cover rounded-lg border"
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="destructive"
                                      onClick={removeImage}
                                    >
                                      Remove image
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500">No image uploaded</p>
                              )}
                            </div>

                      {/* Toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
                          />
                          Published (visible to public)
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.isFeatured}
                            onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                          />
                          Featured (top of public page)
                        </label>
                      </div>
                    </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (editing ? "Saving..." : "Creating...") : editing ? "Save Changes" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <Label className="text-sm text-slate-600 dark:text-slate-300">Search:</Label>
        <Input
          className="w-full sm:max-w-md"
          placeholder="Title, location, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
     {/* ================= MOBILE VIEW ================= */}
        {!loading && filtered.length > 0 && (
          <div className="md:hidden space-y-4">
            {filtered.map((e) => (
            <Card key={e.id}>
              <CardContent className="space-y-2 py-6 text-sm">
                <div className="font-bold">{e.title}</div>

                {e.isFeatured && (
                  <span className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">
                    Featured
                  </span>
                )}

                <div className="text-xs text-slate-600">
                  {e.eventDate
                    ? format(new Date(e.eventDate), "MMM d, yyyy • h:mm a")
                    : "—"}
                </div>

                <div>
                  <span className="font-medium">Location:</span>{" "}
                  {e.location || "—"}
                </div>

                <div>
                  {e.isPublished ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Published
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                      Hidden
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(e)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(e)}
                    disabled={deleting && deleteTarget?.id === e.id}
                  >
                    {deleting && deleteTarget?.id === e.id ? "Deleting..." : "Delete"}
                  </Button>
                  {/* <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(e.id)}
                    disabled={deletingId === e.id}
                  >
                    {deletingId === e.id ? "Deleting..." : "Delete"}
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No events yet.</p>
          ) : (

           <div className="hidden md:block overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[160px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{e.title}</span>
                          {e.isFeatured && (
                            <span className="text-[10px] uppercase tracking-wide text-blue-600 font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {e.eventDate ? format(new Date(e.eventDate), "MMM d, yyyy • h:mm a") : "—"}
                      </TableCell>

                      <TableCell>{e.location || "—"}</TableCell>

                      <TableCell>
                        {e.isPublished ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            Published
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                            Hidden
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(e)}>
                          Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(e)}
                            disabled={deleting && deleteTarget?.id === e.id}
                          >
                            {deleting && deleteTarget?.id === e.id ? "Deleting..." : "Delete"}
                          </Button>
                        {/* <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(e.id)}
                          disabled={deletingId === e.id}
                        >
                          {deletingId === e.id ? "Deleting..." : "Delete"}
                        </Button> */}
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
          title="Delete event?"
          description="This will permanently remove the event and its announcement."
          destructiveLabel={deleteTarget?.title}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}
