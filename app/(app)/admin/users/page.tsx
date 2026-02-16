"use client";

import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { apiFetch } from "@/lib/fetcher";

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
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

/* ---------------- TYPES ---------------- */

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl?: string | null;
};

type Me = {
  id: string;
  role: string;
};

const emptyUser = { name: "", email: "", role: "viewer", password: "" };

function getAvatarSrc(u: UserRow) {
  if (!u.avatarUrl) return "/default-avatar.png";
  return `${u.avatarUrl}?v=${u.id}`;
}

/* ---------------- COMPONENT ---------------- */

export default function AdminUsersPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------------- LOAD ---------------- */

  async function loadMe() {
    try {
      const res = await apiFetch("/api/users/me");
      if (res.ok) setMe(await res.json());
    } catch {}
  }

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
    loadUsers();
  }, []);

  /* ---------------- DIALOG HELPERS ---------------- */

  function openCreate() {
    setEditingId(null);
    setForm(emptyUser);
    setDialogOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditingId(u.id);
    setForm({
      name: u.name ?? "",
      email: u.email,
      role: u.role,
      password: "",
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyUser);
  }

  /* ---------------- SAVE ---------------- */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (editingId && !users.some((u) => u.id === editingId)) {
      toast.error("This user no longer exists.");
      closeDialog();
      loadUsers();
      return;
    }

    setSaving(true);

    const url = editingId
      ? `/api/admin/users/${editingId}`
      : `/api/admin/users`;
    const method = editingId ? "PUT" : "POST";

    const payload: any = {
      name: form.name,
      email: form.email,
      role: form.role,
    };
    if (!editingId) payload.password = form.password;

    try {
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to save user");
        return;
      }

      toast.success(editingId ? "User updated" : "User created");
      closeDialog();
      loadUsers();
    } finally {
      setSaving(false);
    }
  }

  /* ---------------- DELETE ---------------- */

  function cannotDeleteUser(u: UserRow) {
    if (me?.id === u.id) return true;
    if (me?.role === "admin" && u.role === "admin" && u.id !== me.id)
      return true;
    return false;
  }

  async function handleDelete(id: string) {
    setDeletingId(id);

    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete user");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
      setConfirmEmail("");
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-sm text-slate-500">
            Manage admin, editor, and viewer accounts.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(o) => (!o ? closeDialog() : null)}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="w-full h-[60dvh] max-w-none rounded-none overflow-y-auto
                md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-lg">

            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit User" : "Add User"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update user details and role."
                  : "Create a new user account."}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>

              {!editingId && (
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(role) =>
                    setForm((f) => ({ ...f, role }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDialog}
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
          <CardTitle>Users</CardTitle>
        </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : users.length === 0 ? (
                <p className="text-sm text-slate-500">No users found.</p>
              ) : (
                <>
                  {/* ================= MOBILE CARDS ================= */}
                  <div className="space-y-3 md:hidden">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="rounded-lg border p-3 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="border">
                            <AvatarImage src={getAvatarSrc(u)} />
                            <AvatarFallback>
                              {u.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <p className="font-medium">{u.name || "—"}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>

                          <span className="text-xs rounded-md bg-slate-100 px-2 py-1 capitalize">
                            {u.role}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => openEdit(u)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            disabled={cannotDeleteUser(u)}
                            onClick={() => {
                              setDeleteTarget(u);
                              setConfirmEmail("");
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ================= DESKTOP TABLE ================= */}
                  <div className="hidden md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Avatar</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <Avatar className="border">
                                <AvatarImage src={getAvatarSrc(u)} />
                                <AvatarFallback>
                                  {u.name?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>

                            <TableCell>{u.name || "—"}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell className="capitalize">{u.role}</TableCell>

                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEdit(u)}
                              >
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={cannotDeleteUser(u)}
                                onClick={() => {
                                  setDeleteTarget(u);
                                  setConfirmEmail("");
                                }}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>

      </Card>

      {/* DELETE CONFIRM */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setConfirmEmail("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>This action cannot be undone.</p>
                <p>
                  Type <strong>{deleteTarget?.email}</strong> to confirm.
                </p>
                <Input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={
                !deleteTarget ||
                confirmEmail !== deleteTarget.email ||
                !!deletingId
              }
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}






// "use client";

// import { useEffect, useState, FormEvent } from "react";
// import { toast } from "sonner";
// import { Plus } from "lucide-react";

// import { apiFetch } from "@/lib/fetcher";

// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";

// import {
//   Dialog, DialogContent, DialogHeader, DialogDescription,
//   DialogTitle, DialogTrigger,
// } from "@/components/ui/dialog";

// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/components/ui/alert-dialog";

// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// import {
//   Select, SelectTrigger, SelectContent, SelectItem, SelectValue
// } from "@/components/ui/select";

// /* ---------------- TYPES ---------------- */
// type UserRow = {
//   id: string;
//   name: string | null;
//   email: string;
//   role: string;
//   avatarUrl?: string | null;
// };

// /* ---------------- DEFAULT FORM ---------------- */
// const emptyUser = {
//   name: "",
//   email: "",
//   role: "viewer",
//   password: "",
// };

// function getAvatarSrc(u: UserRow) {
//   if (!u.avatarUrl) return "/default-avatar.png";
//   return `${u.avatarUrl}?v=${u.id}`;
// }

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<UserRow[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyUser);
//   const [saving, setSaving] = useState(false);

//   const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const isDeleteOpen = !!deleteTarget;
//   const [confirmEmail, setConfirmEmail] = useState("");

//   setConfirmEmail("");

//   /* ---------------- LOAD USERS ---------------- */
//   async function load() {
//     setLoading(true);
//     try {
//       const res = await apiFetch("/api/admin/users");
//       const data = await res.json();
//       setUsers(data);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   /* ---------------- OPEN MODALS ---------------- */
//   function openCreate() {
//     setEditingId(null);
//     setForm(emptyUser);
//     setDialogOpen(true);
//   }

//   function openEdit(u: UserRow) {
//     setEditingId(u.id);
//     setForm({
//       name: u.name ?? "",
//       email: u.email,
//       role: u.role,
//       password: "",
//     });
//     setDialogOpen(true);
//   }

//   /* ---------------- SAVE USER ---------------- */
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setSaving(true);

//     const url = editingId
//       ? `/api/admin/users/${editingId}`
//       : `/api/admin/users`;

//     const method = editingId ? "PUT" : "POST";

//     const payload: any = {
//       name: form.name,
//       email: form.email,
//       role: form.role,
//     };

//     if (!editingId) payload.password = form.password;

//     const res = await apiFetch(url, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       const err = await res.json();
//       if (res.status === 409) {
//         toast.error("Email already used");
//       } else {
//         toast.error(err.message || "Failed to save user");
//       }
//       setSaving(false);
//       return;
//     }

//     toast.success(editingId ? "User updated!" : "User created!");
//     setSaving(false);
//     setDialogOpen(false);
//     load();
//   }

//   /* ---------------- DELETE USER ---------------- */
//   async function handleDelete(id: string) {
//     setDeletingId(id);

//     try {
//       const res = await apiFetch(`/api/admin/users/${id}`, {
//         method: "DELETE",
//       });

//       if (!res.ok) {
//         toast.error("Deletion failed");
//         return;
//       }

//       toast.success("User deleted");
//       load();
//     } finally {
//       setDeletingId(null);
//       setDeleteTarget(null);
//     }
//   }

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">User Management</h1>

//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={openCreate}>
//               <Plus className="w-4 h-4 mr-1" /> Add User
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {editingId ? "Edit User" : "Add User"}
//               </DialogTitle>
//               <DialogDescription>
//                 {editingId ? "Modify user details." : "Create a new user."}
//               </DialogDescription>
//             </DialogHeader>

//             <form className="space-y-4" onSubmit={handleSubmit}>
//               <div>
//                 <Label>Name</Label>
//                 <Input
//                   value={form.name}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, name: e.target.value }))
//                   }
//                 />
//               </div>

//               <div>
//                 <Label>Email</Label>
//                 <Input
//                   type="email"
//                   required
//                   value={form.email}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, email: e.target.value }))
//                   }
//                 />
//               </div>

//               {!editingId && (
//                 <div>
//                   <Label>Password</Label>
//                   <Input
//                     type="password"
//                     required
//                     value={form.password}
//                     onChange={(e) =>
//                       setForm((f) => ({ ...f, password: e.target.value }))
//                     }
//                   />
//                 </div>
//               )}

//               <div>
//                 <Label>Role</Label>
//                 <Select
//                   value={form.role}
//                   onValueChange={(role) =>
//                     setForm((f) => ({ ...f, role }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="admin">Admin</SelectItem>
//                     <SelectItem value="editor">Editor</SelectItem>
//                     <SelectItem value="viewer">Viewer</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Button type="submit" disabled={saving}>
//                 {saving ? "Saving..." : "Save User"}
//               </Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Users</CardTitle>
//         </CardHeader>

//         <CardContent>
//           {loading ? (
//             <p>Loading...</p>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Avatar</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {users.map((u) => (
//                   <TableRow key={u.id}>
//                     <TableCell>
//                       <Avatar className="border">
//                         <AvatarImage src={getAvatarSrc(u)} />
//                         <AvatarFallback>
//                           {u.name?.[0]?.toUpperCase() || "U"}
//                         </AvatarFallback>
//                       </Avatar>
//                     </TableCell>
//                     <TableCell>{u.name}</TableCell>
//                     <TableCell>{u.email}</TableCell>
//                     <TableCell>{u.role}</TableCell>
//                     <TableCell className="text-right space-x-2">
//                       <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
//                         Edit
//                       </Button>
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           disabled={u.role === "admin"}
//                           onClick={() => setDeleteTarget(u)}
//                         >
//                           Delete
//                         </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>

//       {/* -------- SINGLE CONTROLLED DELETE DIALOG -------- */}
//       <AlertDialog
//         open={isDeleteOpen}
//         onOpenChange={(open) => !open && setDeleteTarget(null)}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete user?</AlertDialogTitle>
//               <AlertDialogDescription className="space-y-3">
//                 <p>
//                   This action cannot be undone.
//                   <br />
//                   Type the email to confirm deletion:
//                 </p>
//                 <p className="font-medium text-red-600">
//                   {deleteTarget?.email}
//                 </p>
//                 <Input
//                   placeholder="Type email to confirm"
//                   value={confirmEmail}
//                   onChange={(e) => setConfirmEmail(e.target.value)}
//                 />
//               </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <AlertDialogCancel disabled={!!deletingId}>
//               Cancel
//             </AlertDialogCancel>
//                 <AlertDialogAction
//                   className="bg-red-600 hover:bg-red-700"
//                   disabled={
//                     deletingId !== null ||
//                     confirmEmail !== deleteTarget?.email
//                   }
//                   onClick={() => {
//                     if (deleteTarget) handleDelete(deleteTarget.id);
//                   }}
//                 >
//                   {deletingId ? "Deleting..." : "Delete"}
//                 </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }








// "use client";

// import { useEffect, useState, FormEvent } from "react";
// import { toast } from "sonner";

// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";


// import { apiFetch } from "@/lib/fetcher";



// import {
//   Dialog, DialogContent, DialogHeader, DialogDescription,
//   DialogTitle, DialogTrigger,
// } from "@/components/ui/dialog";

// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import {
//   HoverCard,
//   HoverCardTrigger,
//   HoverCardContent,
// } from "@/components/ui/hover-card";


// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select, SelectTrigger, SelectContent,
//   SelectItem, SelectValue
// } from "@/components/ui/select";

// import { Plus } from "lucide-react";

// /* --------------------- TYPES --------------------- */
// type UserRow = {
//   id: string;
//   name: string | null;
//   email: string;
//   role: string;
//   avatarUrl?: string | null;
// };

// /* --------------------- DEFAULT FORM --------------------- */
// const emptyUser = {
//   name: "",
//   email: "",
//   role: "viewer",
//   password: "",
// };


// function getAvatarSrc(u: UserRow) {
//   if (!u.avatarUrl) return "/default-avatar.png";

//   // simple cache-busting (safe)
//   return `${u.avatarUrl}?v=${u.id}`;
// }


// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<UserRow[]>([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState(emptyUser);

//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

  

//   /* --------------------- LOAD USERS --------------------- */
// async function load() {
//   setLoading(true);
//   try {
//     const res = await apiFetch("/api/admin/users");
//     const data = await res.json();
//     setUsers(data);
//   } finally {
//     setLoading(false);
//   }
// }


//   useEffect(() => {
//     load();
//   }, []);

//   /* --------------------- OPEN CREATE FORM --------------------- */
//   function openCreate() {
//     setEditingId(null);
//     setForm(emptyUser);
//     setDialogOpen(true);
//   }

//   /* --------------------- OPEN EDIT FORM --------------------- */
//   function openEdit(u: UserRow) {
//     setEditingId(u.id);
//     setForm({
//       name: u.name ?? "",
//       email: u.email,
//       role: u.role,
//       password: "",
//     });
//     setDialogOpen(true);
//   }

//   /* --------------------- SAVE USER --------------------- */
//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setSaving(true);

//     const url = editingId
//       ? `/api/admin/users/${editingId}`
//       : `/api/admin/users`;

//     const method = editingId ? "PUT" : "POST";

//     const payload: any = {
//       name: form.name,
//       email: form.email,
//       role: form.role,
//     };

//     if (!editingId) payload.password = form.password;

//     // const res = await fetch(url, {
//     //   method,
//     //   headers: { "Content-Type": "application/json" },
//     //   body: JSON.stringify(payload),
//     // });


//       const res = await apiFetch(url, {
//           method,
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });


//     if (!res.ok) {
//       toast.error("Failed to save user");
//       setSaving(false);
//       return;
//     }

//     toast.success(editingId ? "User updated!" : "User created!");

//     setSaving(false);
//     setDialogOpen(false);
//     load();
//   }

//   /* --------------------- DELETE USER --------------------- */
//   async function handleDelete(id: string) {
//     if (!confirm("Delete this user?")) return;

//     setDeletingId(id);

//     // const res = await fetch(`/api/admin/users/${id}`, {
//     //   method: "DELETE",
//     // });

//       const res = await apiFetch(`/api/admin/users/${id}`, {
//         method: "DELETE",
//       });


//     if (!res.ok) {
//       toast.error("Deletion failed");
//       setDeletingId(null);
//       return;
//     }

//     toast.success("User deleted");
//     setDeletingId(null);
//     load();
//   }


  

//   /* --------------------- UI --------------------- */
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">User Management</h1>

//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={openCreate}>
//               <Plus className="w-4 h-4 mr-1" /> Add User
//             </Button>
//           </DialogTrigger>

//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>
//                 {editingId ? "Edit User" : "Add User"}
//               </DialogTitle>

//               <DialogDescription>
//                 {editingId
//                   ? "Modify the details of the selected user."
//                   : "Create a new user by filling in the required fields below."}
//               </DialogDescription>
//             </DialogHeader>

//             <form className="space-y-4" onSubmit={handleSubmit}>
//               <div className="space-y-2">
//                 <Label>Name</Label>
//                 <Input
//                   value={form.name}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, name: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Email</Label>
//                 <Input
//                   type="email"
//                   required
//                   value={form.email}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, email: e.target.value }))
//                   }
//                 />
//               </div>

//               {!editingId && (
//                 <div className="space-y-2">
//                   <Label>Initial Password</Label>
//                   <Input
//                     type="password"
//                     required
//                     value={form.password}
//                     onChange={(e) =>
//                       setForm((f) => ({ ...f, password: e.target.value }))
//                     }
//                   />
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <Label>Role</Label>
//                 <Select
//                   value={form.role}
//                   onValueChange={(role) =>
//                     setForm((f) => ({ ...f, role }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a role" />
//                   </SelectTrigger>

//                   <SelectContent>
//                     <SelectItem value="admin">Admin</SelectItem>
//                     <SelectItem value="editor">Editor</SelectItem>
//                     <SelectItem value="viewer">Viewer</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <Button type="submit" disabled={saving}>
//                 {saving ? "Saving…" : "Save User"}
//               </Button>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* ----------------- TABLE ----------------- */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold">Users</CardTitle>
//         </CardHeader>

//         <CardContent>
//           {loading ? (
//             <p className="text-sm text-muted-foreground">Loading...</p>
//           ) : users.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No users found.</p>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[60px]">Avatar</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Email</TableHead>
//                   <TableHead>Role</TableHead>
//                   <TableHead className="text-right w-[150px]">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>

//              <TableBody>
//                 {users.map((u) => (
//                   <TableRow key={u.id} className="hover:bg-slate-50">

//                     {/* AVATAR + HOVER CARD */}
//                     <TableCell>
//                       <HoverCard>
//                         <HoverCardTrigger>
//                           <Avatar className="w-9 h-9 cursor-pointer border shadow-sm">

//                             <AvatarImage src={getAvatarSrc(u)} alt="User avatar" />

//                                 <AvatarFallback className="bg-gray-200 text-gray-700">
//                                   {u.name
//                                     ? u.name
//                                         .split(" ")
//                                         .map((n) => n[0])
//                                         .slice(0, 2)
//                                         .join("")
//                                         .toUpperCase()
//                                     : "U"}
//                                 </AvatarFallback>

//                           </Avatar>
//                         </HoverCardTrigger>

//                         <HoverCardContent className="w-64 p-4 space-y-2">
//                           <div className="flex items-center gap-3">
//                             <Avatar className="w-12 h-12 border">
//                             <AvatarImage src={getAvatarSrc(u)} />

//                           <AvatarFallback>
//                             {u.name
//                               ? u.name
//                                   .split(" ")
//                                   .map((n) => n[0])
//                                   .slice(0, 2)
//                                   .join("")
//                                   .toUpperCase()
//                               : "U"}
//                           </AvatarFallback>

//                             </Avatar>

//                             <div>
//                               <div className="font-semibold">{u.name || "No name"}</div>
//                               <div className="text-sm text-gray-500">{u.email}</div>
//                             </div>
//                           </div>

//                           <div className="mt-2">
//                             <span
//                               className={`px-2 py-1 rounded-full text-xs font-semibold ${
//                                 u.role === "admin"
//                                   ? "bg-red-100 text-red-700"
//                                   : u.role === "editor"
//                                   ? "bg-blue-100 text-blue-700"
//                                   : "bg-gray-100 text-gray-700"
//                               }`}
//                             >
//                               {u.role}
//                             </span>
//                           </div>

//                           <div className="text-xs text-gray-400">ID: {u.id}</div>
//                         </HoverCardContent>
//                       </HoverCard>
//                     </TableCell>

//                     {/* NAME */}
//                     <TableCell className="font-medium">
//                       {u.name || <span className="text-muted-foreground">No name</span>}
//                     </TableCell>

//                     {/* EMAIL */}
//                     <TableCell className="text-sm text-muted-foreground">
//                       {u.email}
//                     </TableCell>

//                     {/* ROLE BADGE */}
//                     <TableCell>
//                       <span
//                         className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
//                           u.role === "admin"
//                             ? "bg-red-100 text-red-700"
//                             : u.role === "editor"
//                             ? "bg-blue-100 text-blue-700"
//                             : "bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {u.role}
//                       </span>
//                     </TableCell>

//                     {/* ACTION BUTTONS */}
//                     <TableCell className="text-right space-x-2">
//                       <Button size="sm" variant="outline" onClick={() => openEdit(u)}>
//                         Edit
//                       </Button>

//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         disabled={deletingId === u.id}
//                         onClick={() => handleDelete(u.id)}
//                       >
//                         {deletingId === u.id ? "Deleting..." : "Delete"}
//                       </Button>
//                     </TableCell>

//                   </TableRow>
//                 ))}
//               </TableBody>

//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
