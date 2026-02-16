"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { deleteCloudinary } from "@/lib/deleteCloudinary";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";

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

/* ---------------- TYPES ---------------- */

type Sermon = {
  id: number;
  title: string;
  preacher: string;
  category?: string | null;

  description?: string | null;
  outline?: string | null;
  content?: string | null;

  date: string; // sermon date & time (ISO)

  isPinned?: boolean;

  imageUrl?: string | null;
  imageId?: string | null;

  audioUrl?: string | null;
  audioId?: string | null;

  videoUrl?: string | null;
  videoId?: string | null;

  documentUrl?: string | null;
  documentId?: string | null;
  
  createdAt?: string | null;
};

type FormState = {
  title: string;
  preacher: string;
  category: string;
  description: string;
  outline: string;
  content: string;

  // datetime-local
  date: string;

  isPinned: boolean;

  imageUrl: string;
  imageId: string;

  audioUrl: string;
  audioId: string;

  videoUrl: string;
  videoId: string;

  documentUrl: string;
  documentId: string;
};

const emptyForm: FormState = {
  title: "",
  preacher: "",
  category: "",
  description: "",
  outline: "",
  content: "",
  date: "",

  isPinned: false,

  imageUrl: "",
  imageId: "",

  audioUrl: "",
  audioId: "",

  videoUrl: "",
  videoId: "",

  documentUrl: "",
  documentId: "",
};

/* ---------------- HELPERS ---------------- */

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

// async function deleteCloudinary(
//   publicId: string,
//   resourceType: "image" | "video" | "raw"
// ) {
//   const res = await fetch("/api/cloudinary/delete", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ publicId, resourceType }),
//   });

//   const text = await res.text();

//   if (!res.ok) {
//     // ✅ treat "not found" as success
//     if (text.includes("not found")) {
//       console.warn("Cloudinary file already deleted:", publicId);
//       return;
//     }

//     throw new Error(text || "Failed to delete file");
//   }
// }

/* ---------------- COMPONENT ---------------- */

export default function AdminSermonsPage() {
  const [items, setItems] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Sermon | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);


  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null);
  const [deleting, setDeleting] = useState(false);


  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/sermons", { cache: "no-store" });
      const data = await res.json();
      setItems(data);
    } catch (e) {
      toast.error("Failed to load sermons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(item: Sermon) {
    setEditing(item);
    setForm({
      title: item.title,
      preacher: item.preacher,
      category: item.category ?? "",
      description: item.description ?? "",
      outline: item.outline ?? "",
      content: item.content ?? "",

      date: isoToDatetimeLocal(item.date),
      isPinned: item.isPinned ?? false,
      imageUrl: item.imageUrl ?? "",
      imageId: item.imageId ?? "",

      audioUrl: item.audioUrl ?? "",
      audioId: item.audioId ?? "",

      videoUrl: item.videoUrl ?? "",
      videoId: item.videoId ?? "",

      documentUrl: item.documentUrl ?? "",
      documentId: item.documentId ?? "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.date) {
      toast.error("Date & time is required");
      return;
    }

    setSaving(true);

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/sermons/${editing.id}` : "/api/sermons";

      const payload = {
        title: form.title,
        preacher: form.preacher,
        category: form.category || null,
        description: form.description || null,
        outline: form.outline || null,
        content: form.content || null,

        isPinned: form.isPinned, // ✅ ADD

        imageUrl: form.imageUrl || null,
        imageId: form.imageId || null,

        audioUrl: form.audioUrl || null,
        audioId: form.audioId || null,

        videoUrl: form.videoUrl || null,
        videoId: form.videoId || null,

        documentUrl: form.documentUrl || null,
        documentId: form.documentId || null,

        date: datetimeLocalToISO(form.date),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(editing ? "Sermon updated" : "Sermon created");
      closeDialog();
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save sermon");
    } finally {
      setSaving(false);
    }
  }

async function handleDeleteConfirmed() {
  if (!deleteTarget) return;

  setDeleting(true);
  const toastId = toast.loading("Deleting sermon...");

  try {
    const res = await fetch(
      `/api/sermons/${deleteTarget.id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    toast.success("Sermon deleted", { id: toastId });
    setDeleteTarget(null);
    await load();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete sermon", { id: toastId });
  } finally {
    setDeleting(false);
  }
}


 async function removeAsset(
  kind: "image" | "audio" | "video" | "document"
) {
  const map = {
    image: { id: "imageId", url: "imageUrl", type: "image" },
    audio: { id: "audioId", url: "audioUrl", type: "video" }, // ✅ audio = video
    video: { id: "videoId", url: "videoUrl", type: "video" },
    document: { id: "documentId", url: "documentUrl", type: "raw" },
  } as const;

  const { id, url, type } = map[kind];
  const publicId = (form as any)[id];

  // ✅ GUARD
  if (!publicId) return;

  try {
    await deleteCloudinary(publicId, type);

    setForm((f) => ({
      ...f,
      [id]: "",
      [url]: "",
    }));

    toast.success(`Removed ${kind}`);
  } catch (err) {
    console.error(err);
    toast.error("Failed to remove file");
  }
}


  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [items]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sermons</h2>
          <p className="text-sm text-slate-500">
            Manage sermons with media uploads.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Sermon</Button>
          </DialogTrigger>

          {/* ✅ Unified dialog UX (same as Bible Studies) */}
          <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Sermon" : "Add Sermon"}</DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the details of this Sermon."
                    : "Fill out the form to add a new Sermon."}
                </DialogDescription>
            </DialogHeader>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* BASIC */}
              <div className="rounded-lg border p-4 space-y-4">
                
                <h3 className="text-sm font-semibold text-slate-700">
                  Basic Information
                </h3>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isPinned}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isPinned: e.target.checked }))
                      }
                      className="h-4 w-4"
                    />
                    <Label className="cursor-pointer">
                      📌 Pin this sermon (always show on top)
                    </Label>
                  </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    required
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preacher</Label>
                  <Input
                    value={form.preacher}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, preacher: e.target.value }))
                    }
                    required
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    placeholder="Sunday Worship, Youth, Special"
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    required
                    className="text-base"
                  />
                </div>
              </div>

              {/* CONTENT */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Content</h3>

                <div className="space-y-2">
                  <Label>Outline</Label>
                  <Textarea
                    rows={6}
                    value={form.outline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, outline: e.target.value }))
                    }
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Full Content / Manuscript</Label>
                  <Textarea
                    rows={10}
                    value={form.content}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, content: e.target.value }))
                    }
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (Summary)</Label>
                  <Textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="text-base"
                  />
                </div>
              </div>

              {/* MEDIA (keep your existing previews exactly) */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Media</h3>

                {/* IMAGE BLOCK */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Image</p>
                      <p className="text-xs text-slate-500">Cover/thumbnail</p>
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
                          onClick={() => removeAsset("image")}
                        >
                          Remove image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No image uploaded</p>
                  )}
                </div>

                {/* VIDEO BLOCK */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Video</p>
                      <p className="text-xs text-slate-500">MP4 / recording</p>
                    </div>
                    <UploadButton
                      label="Upload video"
                      accept="video/*"
                      type="video"
                      onUploaded={(d) =>
                        setForm((f) => ({
                          ...f,
                          videoUrl: d.url,
                          videoId: d.public_id,
                        }))
                      }
                    />
                  </div>

                  {form.videoUrl ? (
                    <div className="space-y-2">
                      <video controls className="w-full rounded-lg border">
                        <source src={form.videoUrl} />
                      </video>
                      <div className="flex items-center justify-between gap-2">
                        <a
                          className="text-xs underline text-slate-600"
                          href={form.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open video in new tab
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAsset("video")}
                        >
                          Remove video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No video uploaded</p>
                  )}
                </div>

                {/* AUDIO BLOCK */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Audio</p>
                      <p className="text-xs text-slate-500">MP3 / recording</p>
                    </div>
                    <UploadButton
                      label="Upload audio"
                      accept="audio/*"
                      type="audio"
                      onUploaded={(d) =>
                        setForm((f) => ({
                          ...f,
                          audioUrl: d.url,
                          audioId: d.public_id,
                        }))
                      }
                    />
                  </div>

                  {form.audioUrl ? (
                    <div className="space-y-2">
                      <audio controls className="w-full">
                        <source src={form.audioUrl} />
                      </audio>
                      <div className="flex items-center justify-between gap-2">
                        <a
                          className="text-xs underline text-slate-600"
                          href={form.audioUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open audio in new tab
                        </a>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAsset("audio")}
                        >
                          Remove audio
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No audio uploaded</p>
                  )}
                </div>

                {/* DOCUMENT BLOCK */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Document</p>
                      <p className="text-xs text-slate-500">PDF / PPT / PPTX</p>
                    </div>
                    <UploadButton
                      label="Upload document"
                      accept=".pdf,.ppt,.pptx"
                      type="document"
                      onUploaded={(d) =>
                        setForm((f) => ({
                          ...f,
                          documentUrl: d.url,
                          documentId: d.public_id,
                        }))
                      }
                    />
                  </div>

                  {form.documentUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <a
                          href={form.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          View document
                        </a>
                        <a href={form.documentUrl} download className="underline">
                          Download
                        </a>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAsset("document")}
                        >
                          Remove document
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No document uploaded</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Sermons</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : sortedItems.length === 0 ? (
            <p className="text-sm text-slate-500">No sermons yet.</p>
          ) : (
            <div className="space-y-4">
              {/* ✅ Mobile cards */}
              <div className="md:hidden space-y-3">
                {sortedItems.map((s) => (
                  <div key={s.id} className="rounded-lg border p-4 space-y-2">
                    <div className="font-semibold">{s.title}</div>
                    <div className="text-sm text-slate-600">{s.preacher}</div>
                    {s.category ? (
                      <div className="text-xs text-slate-500">
                        Category: {s.category}
                      </div>
                    ) : null}
                    <div className="text-xs text-slate-500">
                      {format(new Date(s.date), "MMM d, yyyy • h:mm a")}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
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
                        // onClick={() => handleDelete(s.id)}
                        onClick={() => setDeleteTarget(s)}
                        disabled={deleting && deleteTarget?.id === s.id}
                        // disabled={deletingId === s.id}
                      >
                        {deletingId === s.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Preacher</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right w-[180px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.title}</TableCell>
                        <TableCell>{s.preacher}</TableCell>
                        <TableCell>{s.category || "-"}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {format(new Date(s.date), "MMM d, yyyy • h:mm a")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
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
                              // disabled={deletingId === s.id}
                            >
                              {deletingId === s.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        <ConfirmDeleteDialog
          open={!!deleteTarget}
          loading={deleting}
          title="Delete sermon?"
          description="This action will permanently remove the sermon and all associated media."
          destructiveLabel={
            deleteTarget
              ? `${deleteTarget.title} • ${format(
                  new Date(deleteTarget.date),
                  "MMM d, yyyy"
                )}`
              : undefined
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}
