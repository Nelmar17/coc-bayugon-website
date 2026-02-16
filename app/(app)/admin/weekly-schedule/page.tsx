"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

type WeeklyItem = {
  id: number;
  day: string;
  title: string;
  time: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

const schema = z.object({
  day: z.string().min(1, "Day is required"),
  title: z.string().min(1, "Title is required"),
  time: z.string().min(1, "Time is required"),
  order: z.coerce.number().int().min(0),
  isVisible: z.boolean(),
});

type FormState = z.infer<typeof schema>;

const emptyForm: FormState = {
  day: "Sunday",
  title: "",
  time: "",
  order: 0,
  isVisible: true,
};

export default function AdminWeeklySchedulePage() {
  const [items, setItems] = useState<WeeklyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WeeklyItem | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // const [deletingId, setDeletingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<WeeklyItem | null>(null);
  const [deleting, setDeleting] = useState(false);


  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/weekly-schedule", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load weekly schedule");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const out: Record<string, WeeklyItem[]> = {};
    for (const i of items) {
      out[i.day] = out[i.day] || [];
      out[i.day].push(i);
    }
    Object.values(out).forEach((arr) => arr.sort((a, b) => a.order - b.order));
    return out;
  }, [items]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, order: (items?.length ?? 0) });
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(item: WeeklyItem) {
    setEditing(item);
    setForm({
      day: item.day,
      title: item.title,
      time: item.time,
      order: item.order ?? 0,
      isVisible: item.isVisible,
    });
    setErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0];
        if (typeof k === "string" && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      setSaving(false);
      return;
    }

    setErrors({});

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `/api/admin/weekly-schedule/${editing.id}`
        : "/api/admin/weekly-schedule";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        console.error(await res.text());
        toast.error("Failed to save");
        return;
      }

      toast.success(editing ? "Updated" : "Created");
      closeDialog();
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Error saving");
    } finally {
      setSaving(false);
    }
  }


  async function handleDeleteConfirmed() {
  if (!deleteTarget) return;

  setDeleting(true);
  const toastId = toast.loading("Deleting service...");

  try {
    const res = await fetch(
      `/api/admin/weekly-schedule/${deleteTarget.id}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || "Failed to delete");
    }

    toast.success("Service deleted", { id: toastId });
    setDeleteTarget(null);
    await load();
  } catch (err: any) {
    toast.error(err.message || "Error deleting", { id: toastId });
  } finally {
    setDeleting(false);
  }
}

  // async function handleDelete(id: number) {
  //   if (!confirm("Delete this weekly schedule item?")) return;

  //   setDeletingId(id);
  //   try {
  //     const res = await fetch(`/api/admin/weekly-schedule/${id}`, { method: "DELETE" });
  //     if (!res.ok) {
  //       console.error(await res.text());
  //       toast.error("Failed to delete");
  //       return;
  //     }
  //     toast.success("Deleted");
  //     await load();
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Error deleting");
  //   } finally {
  //     setDeletingId(null);
  //   }
  // }

  async function quickToggle(item: WeeklyItem) {
    // instant toggle (no dialog)
    const next = !item.isVisible;
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isVisible: next } : x)));

    const res = await fetch(`/api/admin/weekly-schedule/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: item.day,
        title: item.title,
        time: item.time,
        order: item.order,
        isVisible: next,
      }),
    });

    if (!res.ok) {
      // revert
      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isVisible: item.isVisible } : x)));
      toast.error("Failed to toggle visibility");
      return;
    }
    toast.success(next ? "Visible" : "Hidden");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Weekly Worship Schedule</h2>
          <p className="text-sm text-slate-500">
            Manage the static weekly schedule (editable + reusable).
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Service</Button>
          </DialogTrigger>

          <DialogContent className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Service" : "Add Service"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update the details of this Service."
                  : "Fill out the form to add a new Service."}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <select
                    className="border rounded-md px-3 py-2 text-sm w-full bg-white dark:bg-slate-900 dark:border-slate-700"
                    value={form.day}
                    onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {errors.day && <p className="text-xs text-red-500">{errors.day}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Bible Study / Worship Service"
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      value={form.time}
                      onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                      placeholder="9:30 AM"
                    />
                    {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      value={form.order}
                      onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    />
                    {errors.order && <p className="text-xs text-red-500">{errors.order}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Visible</p>
                    <p className="text-xs text-slate-500">Show this item on public pages</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, isVisible: !f.isVisible }))}
                    className={`w-12 h-7 rounded-full relative transition ${
                      form.isVisible ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    aria-label="Toggle visibility"
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
                        form.isVisible ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

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
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No weekly schedule items yet.</p>
          ) : (
            <div className="space-y-6">
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {items
                  .slice()
                  .sort((a, b) => a.day.localeCompare(b.day) || a.order - b.order)
                  .map((s) => (
                    <div key={s.id} className="rounded-xl border p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{s.title}</div>
                          <div className="text-xs text-slate-500">
                            {s.day} • {s.time} • order {s.order}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => quickToggle(s)}
                        >
                          {s.isVisible ? "Hide" : "Show"}
                        </Button>
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
                          Delete
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
                  ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[850px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items
                      .slice()
                      .sort((a, b) => a.day.localeCompare(b.day) || a.order - b.order)
                      .map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.day}</TableCell>
                          <TableCell className="font-medium">{s.title}</TableCell>
                          <TableCell>{s.time}</TableCell>
                          <TableCell>{s.order}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => quickToggle(s)}
                            >
                              {s.isVisible ? "Visible" : "Hidden"}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget(s)}
                              disabled={deleting && deleteTarget?.id === s.id}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {/* Group preview by day (optional nice) */}
              <div className="rounded-xl border p-4 bg-slate-50/40 dark:bg-slate-900/30">
                <p className="text-sm font-semibold mb-3">Preview (Grouped)</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(grouped).map(([day, arr]) => (
                    <div key={day} className="rounded-lg border p-3 bg-white dark:bg-slate-900">
                      <div className="font-semibold">{day}</div>
                      <ul className="mt-2 text-sm space-y-1">
                        {arr.map((x) => (
                          <li key={x.id} className={x.isVisible ? "" : "opacity-50"}>
                            {x.title} — {x.time}{" "}
                            {!x.isVisible && <span className="text-xs">(hidden)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
          open={!!deleteTarget}
          loading={deleting}
          title="Delete weekly service?"
          description="This will permanently remove this service from the weekly schedule."
          destructiveLabel={
            deleteTarget
              ? `${deleteTarget.day} • ${deleteTarget.title}`
              : undefined
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />

    </div>
  );
}
