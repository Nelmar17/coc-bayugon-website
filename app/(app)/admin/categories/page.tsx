"use client";

import { useEffect, useState } from "react";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: number;
  name: string;
};

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);



  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCategory() {
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        toast.error(await res.text());
        return;
      }

      toast.success("Category created");
      setNewName("");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  async function updateCategory(id: number) {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });

      if (!res.ok) {
        toast.error(await res.text());
        return;
      }

      toast.success("Category updated");
      setEditingId(null);
      setEditingName("");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    }
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;

    setDeleting(true);
    const toastId = toast.loading("Deleting category...");

    try {
      const res = await fetch(
        `/api/categories/${deleteTarget.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("Category deleted", { id: toastId });
      setDeleteTarget(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category", { id: toastId });
    } finally {
      setDeleting(false);
    }
  }


  return (
    <div className="space-y-6">
      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CREATE */}
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button onClick={createCategory} disabled={saving}>
              Add
            </Button>
          </div>

          {/* TABLE */}
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      {editingId === c.id ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                        />
                      ) : (
                        c.name
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {editingId === c.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateCategory(c.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(c.id);
                              setEditingName(c.name);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(c)}
                            disabled={deleting && deleteTarget?.id === c.id}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        loading={deleting}
        title="Delete category?"
        description="This category may be used by Bible Studies or Sermons."
        destructiveLabel={deleteTarget?.name}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />

    </div>
  );
}
