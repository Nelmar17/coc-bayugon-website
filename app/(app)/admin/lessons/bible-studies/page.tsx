"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { deleteCloudinary } from "@/lib/deleteCloudinary";
import { useCategories } from "@/lib/category-context";
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

type Category = {
  id: number;
  name: string;
};

type BibleStudy = {
  id: number;
  title: string;
  speaker?: string | null;
  description?: string | null;
  outline?: string | null;
  content?: string | null;

  studyDate: string; // ISO string from API
  isPinned?: boolean;

  categoryId?: number | null;
  category?: Category | null;

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
  speaker: string;
  description: string;
  outline: string;
  content: string;
  
  // datetime-local value: "YYYY-MM-DDTHH:mm"
  studyDate: string;
  isPinned: boolean;

  categoryId: string;

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
  speaker: "",
  description: "",
  outline: "",
  content: "",
  studyDate: "",
  isPinned: false,
  categoryId: "",

  imageUrl: "",
  imageId: "",

  audioUrl: "",
  audioId: "",

  videoUrl: "",
  videoId: "",

  documentUrl: "",
  documentId: "",
};

function isoToDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function datetimeLocalToISO(dtLocal: string) {
  return new Date(dtLocal).toISOString();
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
//     // 👇 Treat "not found" as success (already deleted)
//     if (text.includes("not found")) {
//       console.warn("Cloudinary file already deleted:", publicId);
//       return;
//     }

//     throw new Error(text || "Failed to delete file");
//   }
// }


export default function AdminBibleStudiesPage() {

 // 🔄 GLOBAL CATEGORY STATE
  const { categories, refresh } = useCategories();

  // optional helper
  async function refreshCategories() {
    await refresh();
  }


  const [items, setItems] = useState<BibleStudy[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BibleStudy | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
 
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [newCategory, setNewCategory] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<BibleStudy | null>(null);
  const [deleting, setDeleting] = useState(false);


  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/bible-studies", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as BibleStudy[];
      setItems(data);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load Bible Studies");
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

 function openEdit(item: BibleStudy) {
  setEditing(item);
  setForm({
    title: item.title ?? "",
    speaker: item.speaker ?? "",
    description: item.description ?? "",
    outline: item.outline ?? "",
    content: item.content ?? "",
    studyDate: isoToDatetimeLocal(item.studyDate),
    isPinned: item.isPinned ?? false,
    categoryId: item.categoryId ? String(item.categoryId) : "", 

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

    if (!form.studyDate) {
      toast.error("Please set Date & Time");
      return;
    }

    setSaving(true);
    const id = editing?.id;

    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/bible-studies/${id}` : "/api/bible-studies";

      const payload = {
        ...form,
        speaker: form.speaker || null,
        description: form.description || null,
        outline: form.outline || null,
        content: form.content || null,

        imageUrl: form.imageUrl || null,
        imageId: form.imageId || null,

        audioUrl: form.audioUrl || null,
        audioId: form.audioId || null,

        videoUrl: form.videoUrl || null,
        videoId: form.videoId || null,
        isPinned: form.isPinned,
        documentUrl: form.documentUrl || null,
        documentId: form.documentId || null,

         categoryId: form.categoryId
        ? Number(form.categoryId)
        : null,

        studyDate: datetimeLocalToISO(form.studyDate),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error(t);
        toast.error("Failed to save Bible Study");
        return;
      }

      toast.success(id ? "Updated Bible Study" : "Created Bible Study");
      closeDialog();
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Error saving Bible Study");
    } finally {
      setSaving(false);
    }
  }


function handleCategoryChange(value: string) {
  if (value === "__add__") {
    setNewCategoryName("");
    setCategoryDialogOpen(true);
    return;
  }

  setForm((f) => ({ ...f, categoryId: value }));
}

async function createCategory() {
  if (!newCategoryName.trim()) {
    toast.error("Category name is required");
    return;
  }

  // 🔒 DUPLICATE CHECK (USING CONTEXT DATA)
  if (
    categories.some(
      (c) =>
        c.name.toLowerCase() ===
        newCategoryName.trim().toLowerCase()
    )
  ) {
    toast.error("Category already exists");
    return;
  }

  setCreatingCategory(true);
  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });

    if (!res.ok) {
      toast.error(await res.text());
      return;
    }

    const created = await res.json();

    await refresh(); // ✅ SINGLE SOURCE OF TRUTH

    setForm((f) => ({
      ...f,
      categoryId: String(created.id),
    }));

    setCategoryDialogOpen(false);
    toast.success("Category created");
  } catch (err) {
    console.error(err);
    toast.error("Failed to create category");
  } finally {
    setCreatingCategory(false);
  }
}


async function handleDeleteConfirmed() {
  if (!deleteTarget) return;

  setDeleting(true);
  const toastId = toast.loading("Deleting Bible Study...");

  try {
    const res = await fetch(
      `/api/bible-studies/${deleteTarget.id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      throw new Error(await res.text());
    }

    toast.success("Bible Study deleted", { id: toastId });
    setDeleteTarget(null);
    await load();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete Bible Study", { id: toastId });
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

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime()
    );
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bible Studies</h2>
          <p className="text-sm text-slate-500">
            Manage Bible Study sessions (with media uploads).
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Bible Study</Button>
          </DialogTrigger>

          {/* ✅ Unified with Events: no full-height mobile hijack */}
          <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Bible Study" : "Add Bible Study"}
              </DialogTitle>
                <DialogDescription>
                  {editing
                    ? "Update the details of Bible Study."
                    : "Fill out the form to add a Sessions"}
                </DialogDescription>
            </DialogHeader>

            <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category name</Label>
                      <Input
                        autoFocus
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Doctrine, Youth, Prayer"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") createCategory();
                        }}
                      />
                    </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setCategoryDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={createCategory}
                          disabled={creatingCategory}
                        >
                          {creatingCategory ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>


            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Section: Basic */}
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
                    id="isPinned"
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPinned" className="cursor-pointer">
                    📌 Pin this study to public page
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
                  <Label>Speaker</Label>
                  <Input
                    value={form.speaker}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, speaker: e.target.value }))
                    }
                    placeholder="Optional"
                    className="text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>

                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={form.categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">— None —</option>

                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}

                    <option value="__add__" className="bg-yellow-400 text-slate-50">➕ Add New Category</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.studyDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, studyDate: e.target.value }))
                    }
                    required
                    className="text-base"
                  />
                  <p className="text-xs text-slate-500">
                    This is the actual schedule/occurrence date of the Bible
                    Study.
                  </p>
                </div>
              </div>

              {/* Section: Content */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">
                  Content
                </h3>

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

              {/* Section: Media */}
              <div className="rounded-lg border p-4 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Media</h3>

                {/* IMAGE */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Image</p>
                      <p className="text-xs text-slate-500">Cover/thumbnail</p>
                    </div>

                    <UploadButton
                      label="Upload Image"
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
                        alt="Bible study image"
                        className="w-full max-h-64 object-cover rounded-lg border"
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAsset("image")}
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No image uploaded yet.</p>
                  )}
                </div>

                {/* AUDIO */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Audio</p>
                      <p className="text-xs text-slate-500">
                        MP3 / audio recording
                      </p>
                    </div>

                    <UploadButton
                      label="Upload Audio"
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
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAsset("audio")}
                        >
                          Remove Audio
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No audio uploaded yet.</p>
                  )}
                </div>

                {/* VIDEO */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Video</p>
                      <p className="text-xs text-slate-500">
                        MP4 / video recording
                      </p>
                    </div>

                    <UploadButton
                      label="Upload Video"
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
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAsset("video")}
                        >
                          Remove Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No video uploaded yet.</p>
                  )}
                </div>

                {/* DOCUMENT */}
                <div className="rounded-lg border bg-slate-50/50 p-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">Document</p>
                      <p className="text-xs text-slate-500">PDF / PPT / PPTX</p>
                    </div>

                    <UploadButton
                      label="Upload PDF / PPT"
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
                      <div className="flex items-center justify-between gap-2">
                        <a
                          className="text-sm underline"
                          href={form.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View document
                        </a>
                        <a className="text-sm underline" href={form.documentUrl} download>
                          Download
                        </a>
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAsset("document")}
                        >
                          Remove Document
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No document uploaded yet.
                    </p>
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

      {/* List */}
      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Bible Studies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : sortedItems.length === 0 ? (
            <p className="text-sm text-slate-500">No Bible Studies yet.</p>
          ) : (
            <div className="space-y-4">
              {/* ✅ Mobile cards */}
              <div className="md:hidden space-y-3">
                {sortedItems.map((b) => (
                  <div key={b.id} className="rounded-lg border p-4 space-y-2">
                    <div className="font-semibold">{b.title}</div>

                    <div className="text-sm text-slate-600">
                      {b.speaker || "—"}
                    </div>

                    <div className="text-xs text-slate-500">
                      {b.studyDate
                        ? format(new Date(b.studyDate), "MMM d, yyyy • h:mm a")
                        : "-"}
                    </div>

                    <div className="text-xs text-slate-400">
                      Created:{" "}
                      {b.createdAt
                        ? format(new Date(b.createdAt), "MMM d, yyyy")
                        : "-"}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(b)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        // onClick={() => handleDelete(b.id)}
                        onClick={() => setDeleteTarget(b)}
                        disabled={deleting && deleteTarget?.id === b.id}
                        // disabled={deletingId === b.id}
                      >
                        {deletingId === b.id ? "Deleting..." : "Delete"}
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
                      <TableHead>Speaker</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date & Time (Study)</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right w-[180px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.title}</TableCell>
                        <TableCell>{b.speaker || "-"}</TableCell>
                        <TableCell>
                        {b.category?.name || "-"}
                        </TableCell>

                        <TableCell className="text-xs text-slate-600">
                          {b.studyDate
                            ? format(
                                new Date(b.studyDate),
                                "MMM d, yyyy • h:mm a"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {b.createdAt
                            ? format(new Date(b.createdAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(b)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              // onClick={() => handleDelete(b.id)}
                              onClick={() => setDeleteTarget(b)}
                              disabled={deleting && deleteTarget?.id === b.id}
                              // disabled={deletingId === b.id}
                            >
                              {deletingId === b.id ? "Deleting..." : "Delete"}
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
        title="Delete Bible Study?"
        description="This will permanently remove the Bible Study and its associated media."
        destructiveLabel={
          deleteTarget
            ? `${deleteTarget.title}${
                deleteTarget.studyDate
                  ? ` • ${format(new Date(deleteTarget.studyDate), "MMM d, yyyy")}`
                  : ""
              }`
            : undefined
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
