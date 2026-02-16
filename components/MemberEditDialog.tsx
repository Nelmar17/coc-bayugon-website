"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */

type Member = {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  congregation?: string | null;
  userId?: string | null;

  birthday?: string | null;        // ✅ ADD
  dateOfBaptism?: string | null;   // ✅ ADD
};


type UserOption = {
  id: string;
  name: string | null;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member?: Member | null; // null = create
  onSaved: () => void;
};


function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


/* ---------------------------------------------
 * Component
 * -------------------------------------------- */

export default function MemberEditDialog({
  open,
  onOpenChange,
  member,
  onSaved,
}: Props) {
  const isEdit = !!member?.id;

  const [form, setForm] = useState<Member>({
    firstName: "",
    lastName: "",
    email: "",
    congregation: "",
    userId: null,
    birthday: "",          // ✅
    dateOfBaptism: "",     // ✅
  });


  const [users, setUsers] = useState<UserOption[]>([]);
  const [saving, setSaving] = useState(false);

  

useEffect(() => {
  if (!form.email || form.userId) return;

  const exact = users.find(
    (u) => u.email.toLowerCase() === form.email!.toLowerCase()
  );

  if (exact) {
    setForm((f) => ({ ...f, userId: exact.id }));
  }
}, [form.email, users]);


  /* ---------------------------------------------
   * Load unlinked users
   * -------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    fetch("/api/admin/users/unlinked", {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => toast.error("Failed to load users"));
  }, [open]);

  /* ---------------------------------------------
   * Init form
   * -------------------------------------------- */

useEffect(() => {
  if (member) {
    setForm({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email ?? "",
      congregation: member.congregation ?? "",
      userId: member.userId ?? null,
      birthday: member.birthday
        ? member.birthday.slice(0, 10)
        : "",
      dateOfBaptism: member.dateOfBaptism
        ? member.dateOfBaptism.slice(0, 10)
        : "",
    });
  } else {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      congregation: "",
      userId: null,
      birthday: "",
      dateOfBaptism: "",
    });
  }
}, [member]);


  /* ---------------------------------------------
   * Auto-suggestions
   * -------------------------------------------- */

    const suggestedUsers = useMemo(() => {
      if (!form.email && !form.firstName) return [];

      const name = form.firstName.toLowerCase();
      const email = (form.email ?? "").toLowerCase();

      return users.filter(
        (u) =>
          u.email.toLowerCase() === email ||
          u.name?.toLowerCase().includes(name)
      );
    }, [users, form.email, form.firstName]);

    const suggestedIds = new Set(suggestedUsers.map((u) => u.id));

    const remainingUsers = users.filter(
      (u) => !suggestedIds.has(u.id)
    );

    const linkedUser = users.find((u) => u.id === form.userId);


  /* ---------------------------------------------
   * Save
   * -------------------------------------------- */

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(
        isEdit
          ? `/api/admin/members/${member!.id}`
          : `/api/admin/members`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to save member");
        return;
      }

      toast.success(isEdit ? "Member updated" : "Member created");
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  /* ---------------------------------------------
   * Render
   * -------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Member" : "Add Member"}
          </DialogTitle>
          <DialogDescription>
            Manage church member details and optional user link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* NAME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">

            <div className="space-y-1">
              <Label>First name</Label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Last name</Label>
              <Input
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>

          {/* CONGREGATION */}
          <div className="space-y-1">
            <Label>Congregation</Label>
            <Input
              value={form.congregation ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, congregation: e.target.value }))
              }
            />
          </div>

          {/* BIRTHDAY */}
            <div className="space-y-1">
              <Label>Birthday</Label>
              <Input
                type="date"
                value={form.birthday ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, birthday: e.target.value }))
                }
              />
            </div>

            {/* DATE OF BAPTISM */}
            <div className="space-y-1">
              <Label>Date of Baptism</Label>
              <Input
                type="date"
                value={form.dateOfBaptism ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dateOfBaptism: e.target.value }))
                }
              />
            </div>

          {/* USER LINK */}
          <div className="space-y-1">
            <Label>Link User (optional)</Label>

            {/* DISPLAY FIELD (NOT Radix text) */}
            <div className="relative">
              <Select
                value={form.userId ?? ""}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    userId: v === "__none__" ? null : v,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <span className="sr-only">Select user</span>
                </SelectTrigger>

                <SelectContent className="max-w-[420px] max-h-[60vh] overflow-y-auto">

                  <SelectItem value="__none__">— None —</SelectItem>

                  {suggestedUsers.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-xs font-medium text-yellow-600">
                        ⭐ Suggested
                      </div>

                      {suggestedUsers.map((u) => (
                        <SelectItem
                          key={u.id}
                          value={u.id}
                          className="py-2 bg-yellow-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-200 text-xs font-bold">
                              {initials(u.name)}
                            </div>

                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {u.name ?? "—"}
                              </span>
                              <span className="text-xs text-slate-500">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}

                  {remainingUsers.map((u) => (
                    <SelectItem
                      key={u.id}
                      value={u.id}
                      className="py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                          {initials(u.name)}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {u.name ?? "—"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* CLEAN SELECTED DISPLAY */}
              <div className="pointer-events-none absolute inset-0 flex items-center gap-3 px-3">
                {linkedUser ? (
                  <>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                      {initials(linkedUser.name)}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {linkedUser.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {linkedUser.email}
                      </div>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-slate-500">
                    No linked user
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* EMAIL MISMATCH WARNING */}
          {linkedUser &&
            form.email &&
            linkedUser.email !== form.email && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm">
                ⚠️ <b>Email mismatch detected</b>
                <br />
                Member email: <b>{form.email}</b>
                <br />
                User email: <b>{linkedUser.email}</b>
              </div>
            )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
