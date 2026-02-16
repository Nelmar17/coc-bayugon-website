"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

type TrashUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  deletedAt: string;
};

export default function TrashUsersPage() {
  const [users, setUsers] = useState<TrashUser[]>([]);

  async function load() {
    const res = await apiFetch("/api/admin/users/trash");
    setUsers(await res.json());
  }

  async function restore(id: string) {
    await apiFetch(`/api/admin/users/${id}/restore`, { method: "POST" });
    toast.success("User restored");
    setUsers((u) => u.filter((x) => x.id !== id));
  }

 async function purge(id: string) {
  const res = await apiFetch(`/api/admin/users/${id}/purge`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    toast.error(err.message || "Failed to purge user");
    return;
  }

  // ✅ ONLY REMOVE IF BACKEND SUCCESS
  setUsers((prev) => prev.filter((u) => u.id !== id));
  toast.success("User permanently deleted");
}


  useEffect(() => {
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deleted Users (Trash)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Deleted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{new Date(u.deletedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" onClick={() => restore(u.id)}>Restore</Button>
                  <Button size="sm" variant="destructive" onClick={() => purge(u.id)}>
                    Purge
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
