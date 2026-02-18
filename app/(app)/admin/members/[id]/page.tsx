"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Member = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  congregation?: string | null;
  birthday?: string | null;
  dateOfBaptism?: string | null;
};

type Attendance = {
  id: number;
  date: string;
  type: "worship" | "bible_study" | "event";
  status: "present" | "absent";
  notes?: string | null;
};

export default function MemberAttendanceProfilePage() {
  const params = useParams();
  const id = params?.id;

  const numericId = Number(id);

  const [member, setMember] = useState<Member | null>(null);
  const [rows, setRows] = useState<Attendance[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!id || Number.isNaN(numericId)) return;

    setLoading(true);
    try {
      // MEMBER
      const mRes = await fetch(`/api/admin/members/${numericId}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!mRes.ok) throw new Error(await mRes.text());
      const m = (await mRes.json()) as Member;
      setMember(m);

      // ATTENDANCE
      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      qs.set("memberId", String(numericId));

      const aRes = await fetch(
        `/api/admin/attendance/history?${qs.toString()}`,
        { cache: "no-store", credentials: "include" }
      );
      if (!aRes.ok) throw new Error(await aRes.text());

      const a = (await aRes.json()) as Attendance[];
      setRows(a);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load member profile");
    } finally {
      setLoading(false);
    }
  }

  // ✅ IMPORTANT: depend on id
  useEffect(() => {
    if (id && !Number.isNaN(numericId)) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id || Number.isNaN(numericId)) {
    return <p className="p-6 text-red-500">Invalid member ID.</p>;
  }

  if (!member) {
    return (
      <p className="p-6">
        {loading ? "Loading..." : "Member not found."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {member.lastName}, {member.firstName}
        </h1>
        <p className="text-sm text-slate-500">
          {member.congregation ?? "—"} • {member.email ?? "—"} •{" "}
          {member.phone ?? "—"}
        </p>
      </div>

      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Filter Attendance</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-end">
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">From</span>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">To</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <Button onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Apply"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">
              {loading ? "Loading..." : "No attendance records."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {format(new Date(r.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="capitalize">{r.type}</TableCell>
                    <TableCell
                      className={
                        r.status === "present"
                          ? "text-emerald-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {r.status === "present" ? "Present" : "Absent"}
                    </TableCell>
                    <TableCell className="max-w-[340px] truncate">
                      {r.notes ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
