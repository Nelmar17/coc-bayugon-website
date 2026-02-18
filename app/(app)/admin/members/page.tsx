"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";


// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import MemberEditDialog from "@/components/MemberEditDialog";


import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash } from "lucide-react";

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */
type Member = {
  id: number;
  firstName: string;
  lastName: string;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  congregation?: string | null;
  birthday?: string | null;
  dateOfBaptism?: string | null;
  
  // 🔗 ADD (read-only, from API)
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;

  emailMismatch?: boolean;
};

/* ---------------------------------------------
 * Empty Form
 * -------------------------------------------- */
const emptyForm = {
  firstName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  congregation: "",
  birthday: "",
  dateOfBaptism: "", 
};

const PAGE_SIZE = 10;

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // 🔍 SEARCH + PAGINATION
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);


  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);


  /* ---------------------------------------------
   * Load Members
   * -------------------------------------------- */
  async function loadMembers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members", {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message ?? "Failed to load members");
        return;
      }

      const data = await res.json();
      setMembers(data);
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  /* ---------------------------------------------
   * SEARCH FILTER
   * -------------------------------------------- */
  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      (m.congregation ?? "").toLowerCase().includes(q)
    );
  });

  /* ---------------------------------------------
   * PAGINATION
   * -------------------------------------------- */
  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);

  const paginatedMembers = filteredMembers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // reset page kapag nag search
  useEffect(() => {
    setPage(1);
  }, [search]);

  /* ---------------------------------------------
   * Open Dialogs
   * -------------------------------------------- */
  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(m: Member) {
    setEditing(m);
    setForm({
      firstName: m.firstName,
      lastName: m.lastName,
      gender: m.gender ?? "",
      phone: m.phone ?? "",
      email: m.email ?? "",
      congregation: m.congregation ?? "",
      birthday: m.birthday ? m.birthday.slice(0, 10) : "",
      dateOfBaptism: m.dateOfBaptism
      ? m.dateOfBaptism.slice(0, 10)
      : "",
    });
    setOpen(true);
  }

  /* ---------------------------------------------
   * Save
   * -------------------------------------------- */
  // async function handleSave(e: React.FormEvent) {
  //   e.preventDefault();
  //   setSaving(true);

  //   try {
  //     const res = await fetch(
  //       editing
  //         ? `/api/admin/members/${editing.id}`
  //         : "/api/admin/members",
  //       {
  //         method: editing ? "PUT" : "POST",
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //         body: JSON.stringify(form),
  //       }
  //     );

  //     if (!res.ok) {
  //       const err = await res.json();
  //       toast.error(err.message ?? "Failed to save member");
  //       return;
  //     }

  //     toast.success(editing ? "Member updated" : "Member created");
  //     setOpen(false);
  //     setEditing(null);
  //     await loadMembers();
  //   } catch {
  //     toast.error("Server error");
  //   } finally {
  //     setSaving(false);
  //   }
  // }

  /* ---------------------------------------------
   * Delete
   * -------------------------------------------- */
async function handleDeleteConfirmed() {
  if (!deleteTarget) return;

  setDeleting(true);
  const toastId = toast.loading("Deleting member...");

  try {
    const res = await fetch(
      `/api/admin/members/${deleteTarget.id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? "Delete failed");
    }

    toast.success("Member deleted", { id: toastId });
    setDeleteTarget(null);
    await loadMembers();
  } catch (err: any) {
    toast.error(err.message ?? "Failed to delete member", {
      id: toastId,
    });
  } finally {
    setDeleting(false);
  }
}


  return (
    <div className="space-y-6">
      {/* HEADER */}
          <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-sm text-slate-500">
            Manage church members for attendance tracking
          </p>
        </div>

            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>

            {/* ✅ ITO ANG ONLY DIALOG */}
            <MemberEditDialog
              open={open}
              onOpenChange={setOpen}
              member={editing}
              onSaved={loadMembers}
            />

        {/* <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>

          </DialogTrigger>
                 
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Member" : "Add Member"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    required
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    required
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Congregation</Label>
                <Input
                  value={form.congregation}
                  onChange={(e) =>
                    setForm({ ...form, congregation: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Date of Baptism</Label>
                <Input
                  type="date"
                  value={form.dateOfBaptism}
                  onChange={(e) =>
                    setForm({ ...form, dateOfBaptism: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog> */}
      </div>

      {/* TABLE */}
      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members List</CardTitle>
          <Badge variant="secondary" className="text-md">
            Total Members: {filteredMembers.length}
          </Badge>
        </CardHeader>

        <CardContent>
          {/* SEARCH */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <Input
              placeholder="Search name, email, or congregation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <p className="text-sm text-slate-500">
              Showing {paginatedMembers.length} of {filteredMembers.length}
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : paginatedMembers.length === 0 ? (
            <p className="text-sm text-slate-500">No members found</p>
          ) : (
            <>
                {/* ================= MOBILE VIEW ================= */}
                <div className="md:hidden space-y-3">
                  {paginatedMembers.map((m) => (
                    <Card key={m.id}>
                      <CardContent className="space-y-2 py-6 text-sm">
                        <div className="font-semibold">
                          <Link
                            href={`/admin/members/${m.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {m.lastName}, {m.firstName}
                          </Link>
                        </div>

                        <div className="text-slate-500">
                          {m.email || "-"} {m.phone && `• ${m.phone}`}
                        </div>

                        <div>
                          Congregation: {m.congregation || "-"}
                        </div>

                       <div>
                          Birthday:{" "}
                          {m.birthday
                            ? format(new Date(m.birthday), "MMM d, yyyy")
                            : "-"}
                        </div>

                        <div>
                          Baptism:{" "}
                          {m.dateOfBaptism
                            ? format(new Date(m.dateOfBaptism), "MMM d, yyyy")
                            : "-"}
                        </div>

                        <div>
                            Account:{" "}
                            {m.user ? (
                              <Badge className="ml-1">Linked</Badge>
                            ) : (
                              <Badge variant="secondary" className="ml-1">
                                Not linked
                              </Badge>
                            )}
                          </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEdit(m)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteTarget(m)}
                            disabled={deleting && deleteTarget?.id === m.id}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
          {/* DESKTOP VIEW   */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Congregation</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Date of Baptism</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right w-[120px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedMembers.map((m) => (
                    <TableRow key={m.id}>
                      {/* <TableCell className="font-medium">
                        {m.lastName}, {m.firstName}
                      </TableCell> */}

                     <TableCell className="font-medium">
                      <Link
                        href={`/admin/members/${m.id}`}
                        className="hover:underline text-blue-600"
                      >
                        {m.lastName}, {m.firstName}
                      </Link>
                    </TableCell>

                      <TableCell className="text-sm text-slate-500">
                        {m.email || "-"}
                        <br />
                        {m.phone || ""}
                      </TableCell>

                      <TableCell>{m.congregation || "-"}</TableCell>
                          <TableCell>
                        {m.birthday
                          ? format(new Date(m.birthday), "MMM d, yyyy")
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {m.dateOfBaptism
                          ? format(new Date(m.dateOfBaptism), "MMM d, yyyy")
                          : "-"}
                      </TableCell>

                      {/* MEMBERS LINKING TO USERS */}
                      <TableCell>
                        {m.user ? (
                          <div className="space-y-1">
                            <Badge variant="default">Linked</Badge>

                            {m.emailMismatch && (
                              <Badge variant="destructive" className="ml-1">
                                Email mismatch
                              </Badge>
                            )}

                            <div className="text-xs text-slate-500">
                              {m.user.email}
                            </div>
                          </div>
                        ) : (
                          <Badge variant="secondary">Not linked</Badge>
                        )}
                      </TableCell>

                     
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(m)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(m)}
                          disabled={deleting && deleteTarget?.id === m.id}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
              {/* PAGINATION */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages || 1}
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages || totalPages === 0}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
          open={!!deleteTarget}
          loading={deleting}
          title="Delete member?"
          description="This will permanently remove this member and their attendance records."
          destructiveLabel={
            deleteTarget
              ? `${deleteTarget.firstName} ${deleteTarget.lastName}`
              : undefined
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
    </div>
  );
}
