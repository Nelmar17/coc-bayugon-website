"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import UploadButton from "@/components/UploadButton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";



type Leader = {
  id: number;
  name: string;
  role: string;
  order: number;
  bio?: string | null;
  imageUrl?: string | null;
  imageId?: string | null;
};

const emptyForm = {
  name: "",
  role: "",
  order: 0,
  bio: "",
  imageUrl: "",
  imageId: "",
};

export default function AdminLeadershipPage() {
  const [items, setItems] = useState<Leader[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<Leader | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);


  const [deleteTarget, setDeleteTarget] = useState<Leader | null>(null);
  const [deleting, setDeleting] = useState(false);



  async function load() {
    const res = await fetch("/api/leaders", { cache: "no-store" });
    setItems(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(l: Leader) {
    setEditing(l);
    setForm({
      name: l.name,
      role: l.role,
      order: l.order,
      bio: l.bio || "",
      imageUrl: l.imageUrl || "",
      imageId: l.imageId || "",
    });
    setOpen(true);
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);

  const url = editing
    ? `/api/leaders/${editing.id}`
    : "/api/leaders";

  const method = editing ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...form,
      imageUrl: form.imageUrl || null,
      imageId: form.imageId || null,
    }),
  });

  if (!res.ok) {
    toast.error("Failed to save leader");
    setSaving(false);
    return;
  }

  toast.success(editing ? "Leader updated" : "Leader added");
  setOpen(false);
  setEditing(null);
  setForm(emptyForm);
  await load();
  setSaving(false);
}

async function handleDeleteConfirmed() {
  if (!deleteTarget) return;

  setDeleting(true);
  const toastId = toast.loading("Deleting leader...");

  try {
    const res = await fetch(`/api/leaders/${deleteTarget.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Delete failed");
    }

    toast.success("Leader deleted", { id: toastId });
    setDeleteTarget(null);
    await load();
  } catch (err) {
    toast.error("Failed to delete leader", { id: toastId });
  } finally {
    setDeleting(false);
  }
}


  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Leadership</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>Add Leader</Button>
          </DialogTrigger>

          <DialogContent aria-describedby={undefined} className="w-full h-[100dvh] md:h-auto md:max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Leader" : "Add Leader"}
              </DialogTitle>
              <DialogDescription>
                  {editing
                    ? "Update the details of this Leader."
                    : "Fill out the form to add a new Leader."}
                </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label>Role</Label>
                <Input
                  value={form.role}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, role: e.target.value }))
                  }
                  required
                />
              </div>

              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((f: any) => ({
                      ...f,
                      order: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...f, bio: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <UploadButton
                  label="Upload Avatar"
                  accept="image/*"
                  type="image"
                  onUploaded={(d) =>
                    setForm((f: any) => ({
                      ...f,
                      imageUrl: d.url,
                      imageId: d.public_id,
                    }))
                  }
                />

                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    className="w-32 h-32 rounded-full object-cover border mx-auto"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
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

      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Leaders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.role}</TableCell>
                  <TableCell>{l.order}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(l)}>
                      Edit
                    </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteTarget(l)}
                      >
                        Delete
                      </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        loading={deleting}
        title="Delete leader?"
        description="This action cannot be undone."
        destructiveLabel={
          deleteTarget
            ? `${deleteTarget.name} — ${deleteTarget.role}`
            : undefined
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
}
