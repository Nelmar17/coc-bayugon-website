"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Trash, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ================= TYPES ================= */

type Member = {
  id: number;
  firstName: string;
  lastName: string;
  congregation?: string | null;
};

type Attendance = {
  id: number;
  date: string; // ISO string
  type: string;
  status: "present" | "absent";
  notes?: string | null;
  member: Member;
};

type Group = {
  key: string;
  date: string; // ISO string
  type: string;
  present: number;
  absent: number;
  total: number;
  items: Attendance[];
};

const GROUP_PAGE_SIZE = 5;

/* ================= PAGE ================= */

export default function AttendanceHistoryPage() {
  const [mounted, setMounted] = useState(false);

  /* ================= STATE ================= */

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");
  const [rows, setRows] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Attendance | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);

  /* ================= MOUNT ================= */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ================= LOAD ================= */

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      if (type) qs.set("type", type);

      const res = await fetch(
        `/api/admin/attendance/history?${qs.toString()}`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
      setExpanded(null);
      setPage(1);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!mounted) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  /* ================= SEARCH ================= */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const hay = [
        r.member?.firstName ?? "",
        r.member?.lastName ?? "",
        r.member?.congregation ?? "",
        r.notes ?? "",
        r.status ?? "",
        r.type ?? "",
        r.date ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [rows, search]);

  /* ================= GROUP ================= */

  const groups: Group[] = useMemo(() => {
    const map = new Map<string, Attendance[]>();

    for (const r of filtered) {
      const day = String(r.date).slice(0, 10);
      const t = String(r.type ?? "");
      const key = `${day}__${t}`;

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }

    const entries = Array.from(map.entries()).sort((a, b) => {
      const [aDay, aType] = a[0].split("__");
      const [bDay, bType] = b[0].split("__");

      if (aDay !== bDay) return aDay < bDay ? 1 : -1;
      return aType.localeCompare(bType);
    });

    return entries.map(([key, items]) => {
      const [day, t] = key.split("__");
      const present = items.filter((i) => i.status === "present").length;

      return {
        key,
        date: day,
        type: t,
        present,
        absent: items.length - present,
        total: items.length,
        items: [...items].sort((x, y) => {
          const a = `${x.member?.lastName ?? ""} ${x.member?.firstName ?? ""}`.toLowerCase();
          const b = `${y.member?.lastName ?? ""} ${y.member?.firstName ?? ""}`.toLowerCase();
          return a.localeCompare(b);
        }),
      };
    });
  }, [filtered]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(groups.length / GROUP_PAGE_SIZE);

  const pagedGroups = useMemo(() => {
    const start = (page - 1) * GROUP_PAGE_SIZE;
    return groups.slice(start, start + GROUP_PAGE_SIZE);
  }, [groups, page]);

  /* ================= RESET PAGE ================= */

  useEffect(() => {
    setPage(1);
    setExpanded(null);
  }, [from, to, type, search]);

  /* ================= DELETE ================= */

  async function deleteRecord(id: number) {
    try {
      const res = await fetch(`/api/admin/attendance/history/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();
      toast.success("Attendance deleted");
      setRows((prev) => prev.filter((x) => x.id !== id));
    } catch {
      toast.error("Failed to delete record");
    }
  }

  /* ================= SAFE RETURN ================= */

  if (!mounted) {
    return null; // or skeleton
  }

  /* ================= JSX CONTINUES BELOW ================= */


  /* ================= UI ================= */

 return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Attendance History</h1>
        <p className="text-sm text-slate-500">
          Grouped by date & service (with notes + congregation)
        </p>
      </div>

       {/* FILTERS */}
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-4">
            {/* FROM */}
            <div className="space-y-1">
              <span className="text-xs text-slate-500 sm:hidden">From date</span>
              <Input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="
                    w-full
                    text-left
                    appearance-none
                    [-webkit-appearance:none]
                    [&::-webkit-date-and-time-value]:text-left
                    [&::-webkit-datetime-edit]:text-left
                    [&::-webkit-datetime-edit-fields-wrapper]:text-left
                  "
                />
            </div>

            {/* TO */}
            <div className="space-y-1">
              <span className="text-xs text-slate-500 sm:hidden">To date</span>
                  <Input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="
                    w-full
                    text-left
                    appearance-none
                    [-webkit-appearance:none]
                    [&::-webkit-date-and-time-value]:text-left
                    [&::-webkit-datetime-edit]:text-left
                    [&::-webkit-datetime-edit-fields-wrapper]:text-left
                  "
                />
            </div>

            {/* TYPE */}
            <div className="space-y-1">
              <span className="text-xs text-slate-500 sm:hidden">Service type</span>
              <Input
                placeholder="Service type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>

            <Button onClick={load}>
              {loading ? "Loading..." : "Filter"}
            </Button>
          </CardContent>
        </Card>


      {/* SEARCH */}
      <Input
        placeholder="Search member / notes / congregation…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* ================= MOBILE (NEW, SAFE) ================= */}
      <div className="md:hidden space-y-4">
        {pagedGroups.map((g) => (
          <Card key={g.key}>
            <CardContent className="space-y-4 pt-6">
              <div className="font-semibold">
                {format(new Date(g.date), "MMM d, yyyy")}
              </div>
              <div className="capitalize text-sm text-slate-500">{g.type}</div>
              <div className="flex gap-4 text-sm">
                <span className="text-emerald-600">Present {g.present}</span>
                <span className="text-red-600">Absent {g.absent}</span>
                <span>Total {g.total}</span>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setExpanded(expanded === g.key ? null : g.key)
                }
              >
                {expanded === g.key ? "Hide Records" : "View Records"}
              </Button>

              {expanded === g.key &&
                g.items.map((r) => (
                  <Card key={r.id} className="mt-2">
                    <CardContent className="text-sm space-y-2 pt-6">
                      <div className="font-medium">
                        {r.member.lastName}, {r.member.firstName}
                      </div>
                      <div>{r.member.congregation ?? "-"}</div>
                      <div
                        className={
                          r.status === "present"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {r.status}
                      </div>
                      {r.notes && (
                        <div className="text-slate-500">{r.notes}</div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

        {/* ================= DESKTOP (ORIGINAL TABLE, WRAPPED) ================= */}
      <div className="hidden md:block overflow-x-auto">
      {/* TABLE */}
        <Card>
        <CardHeader>
        <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <p className="text-sm text-slate-500">No records found.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px]" />
                    <TableHead>Date</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Absent</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>

                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pagedGroups.map((g) => {
                    const open = expanded === g.key;

                    return (
                      <React.Fragment key={g.key}>
                        {/* GROUP ROW */}
                        <TableRow
                          className="cursor-pointer bg-slate-50 hover:bg-slate-100"
                          onClick={() => setExpanded(open ? null : g.key)}
                        >
                          {/* <TableCell className="w-[32px]">
                            {open ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )} */}

                            <TableCell className="w-[32px]">
                            {open ? <ChevronDown /> : <ChevronRight />}

                          </TableCell>

                          <TableCell>{format(new Date(g.date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="capitalize">{g.type}</TableCell>

                          <TableCell className="text-right text-emerald-600 font-medium">
                            {g.present}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            {g.absent}
                          </TableCell>
                          <TableCell className="text-right font-semibold">{g.total}</TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteGroup(g);
                              }}
                            >
                              Delete All
                            </Button>
                          </TableCell>

                        </TableRow>

                        {/* CHILD ROWS (with CONGREGATION + NOTES) */}
                        {open && (
                          <TableRow>
                            <TableCell colSpan={6} className="bg-white">
                              <div className="rounded-md border bg-white">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                       <TableHead className="w-[32px]" />
                                      <TableHead>Date</TableHead>
                                      <TableHead>Member</TableHead>
                                      <TableHead>Service</TableHead>
                                      <TableHead>Congregation</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Notes</TableHead>
                                      <TableHead className="w-[72px] text-right">
                                        Actions
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>

                                  <TableBody>
                                    {g.items.map((r) => (
                                      <TableRow key={`rec_${g.key}_${r.id}`}>

                                           <TableCell className="w-[32px]">
                                            <FileText />

                                          </TableCell>
                                        <TableCell>{format(new Date(g.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                          {r.member?.lastName}, {r.member?.firstName}
                                        </TableCell>
                                        <TableCell className="capitalize">{g.type}</TableCell>
                                        <TableCell>{r.member?.congregation ?? "-"}</TableCell>
                                        <TableCell
                                          className={
                                            r.status === "present"
                                              ? "text-emerald-600 font-medium"
                                              : "text-red-600 font-medium"
                                          }
                                        >
                                          {r.status === "present" ? "Present" : "Absent"}
                                        </TableCell>
                                        <TableCell className="max-w-[420px] truncate">
                                          {r.notes ?? "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation(); // importante para di mag collapse group
                                                setDeleteTarget(r);
                                              }}
                                            >
                                              <Trash className="w-4 h-4" />
                                            </Button>                                 
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>

              {/* GROUP PAGINATION */}
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
    </div>
          {/* DELETE CONFIRM */}
          <AlertDialog
            open={!!deleteTarget}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete attendance record?</AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be undone.
                  <br />
                  <br />
                  <strong>
                    {deleteTarget
                      ? `${deleteTarget.member.lastName}, ${deleteTarget.member.firstName}`
                      : ""}
                  </strong>
                  <br />
                  {deleteTarget
                    ? `${format(new Date(deleteTarget.date), "MMM d, yyyy")} — ${deleteTarget.type}`
                    : ""}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    if (!deleteTarget) return;

                    try {
                      const res = await fetch(
                        `/api/admin/attendance/history/${deleteTarget.id}`,
                        {
                          method: "DELETE",
                          credentials: "include",
                        }
                      );

                      if (!res.ok) throw new Error();

                      toast.success("Attendance deleted");

                      setRows((prev) =>
                        prev.filter((x) => x.id !== deleteTarget.id)
                      );
                    } catch {
                      toast.error("Failed to delete record");
                    } finally {
                      setDeleteTarget(null);
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

      {/* DELETE GROUP CONFIRM */}
        <AlertDialog
          open={!!deleteGroup}
          onOpenChange={(open) => {
            if (!open) setDeleteGroup(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete all attendance records?
              </AlertDialogTitle>

              <AlertDialogDescription>
                This will permanently delete <strong>ALL</strong> attendance
                records for:
                <br />
                <br />
                <strong>
                  {deleteGroup
                    ? `${format(new Date(deleteGroup.date), "MMM d, yyyy")} — ${deleteGroup.type}`
                    : ""}
                </strong>
                <br />
                ({deleteGroup?.total ?? 0} records)
                <br />
                <br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>

              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={async () => {
                  if (!deleteGroup) return;

                  try {
                    const qs = new URLSearchParams({
                      date: deleteGroup.date,
                      type: deleteGroup.type,
                    });

                    const res = await fetch(
                      `/api/admin/attendance/history/group?${qs.toString()}`,
                      {
                        method: "DELETE",
                        credentials: "include",
                      }
                    );

                    if (!res.ok) throw new Error();

                    toast.success("Attendance group deleted");

                    // remove from UI
                  setRows((prev) =>
                      prev.filter(
                        (r) =>
                          !(
                            r.date.slice(0, 10) === deleteGroup.date &&
                            r.type === deleteGroup.type
                          )
                      )
                    );
                  // optional but recommended
                  setExpanded(null);

                  } catch {
                    toast.error("Failed to delete attendance group");
                  } finally {
                    setDeleteGroup(null);
                  }
                }}
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
    
  );
}


























// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import { format } from "date-fns";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Trash } from "lucide-react";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// /* ---------------------------------------------
//  * Types
//  * -------------------------------------------- */
// type Member = {
//   id: number;
//   firstName: string;
//   lastName: string;
//   congregation?: string | null;
// };

// type Attendance = {
//   id: number;
//   date: string;
//   type: string;
//   status: "present" | "absent";
//   notes?: string | null;
//   member: Member;
// };

// const PAGE_SIZE = 10;

// export default function AttendanceHistoryPage() {
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [type, setType] = useState("");

//   const [rows, setRows] = useState<Attendance[]>([]);
//   const [loading, setLoading] = useState(false);

//   // 🔍 SEARCH + PAGINATION
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);

//   /* ---------------------------------------------
//    * Load History
//    * -------------------------------------------- */
//   async function load() {
//     setLoading(true);
//     try {
//       const qs = new URLSearchParams();
//       if (from) qs.set("from", from);
//       if (to) qs.set("to", to);
//       if (type) qs.set("type", type);

//       const res = await fetch(
//         `/api/admin/attendance/history?${qs.toString()}`,
//         {
//           cache: "no-store",
//           credentials: "include",
//         }
//       );

//       if (!res.ok) throw new Error(await res.text());
//       const data = (await res.json()) as Attendance[];
//       setRows(data);
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load history");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ---------------------------------------------
//    * SEARCH FILTER
//    * -------------------------------------------- */
//   const filteredRows = useMemo(() => {
//     const q = search.toLowerCase();

//     return rows.filter((r) => {
//       return (
//         r.member.firstName.toLowerCase().includes(q) ||
//         r.member.lastName.toLowerCase().includes(q) ||
//         (r.member.congregation ?? "").toLowerCase().includes(q) ||
//         (r.notes ?? "").toLowerCase().includes(q)
//       );
//     });
//   }, [rows, search]);

//   /* ---------------------------------------------
//    * PAGINATION
//    * -------------------------------------------- */
//   const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);

//   const paginatedRows = filteredRows.slice(
//     (page - 1) * PAGE_SIZE,
//     page * PAGE_SIZE
//   );

//   // reset page kapag nag search
//   useEffect(() => {
//     setPage(1);
//   }, [search, from, to, type]);

//   /* ---------------------------------------------
//    * SUMMARY (based on filtered rows)
//    * -------------------------------------------- */
//   const summary = useMemo(() => {
//     const total = filteredRows.length;
//     const present = filteredRows.filter(
//       (r) => r.status === "present"
//     ).length;

//     return {
//       total,
//       present,
//       absent: total - present,
//     };
//   }, [filteredRows]);

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">Attendance History</h1>
//           <p className="text-sm text-slate-500">
//             Browse attendance records by date range and service.
//           </p>
//         </div>

//         {/* FILTERS */}
//         <div className="w-full sm:w-auto">
//           <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-end">
//             <div className="grid gap-1">
//               <span className="text-xs text-slate-500">From</span>
//               <Input
//                 type="date"
//                 value={from}
//                 onChange={(e) => setFrom(e.target.value)}
//                 className="sm:w-[180px]"
//               />
//             </div>

//             <div className="grid gap-1">
//               <span className="text-xs text-slate-500">To</span>
//               <Input
//                 type="date"
//                 value={to}
//                 onChange={(e) => setTo(e.target.value)}
//                 className="sm:w-[180px]"
//               />
//             </div>

//             <div className="grid gap-1">
//               <span className="text-xs text-slate-500">Service</span>
//               <Input
//                 placeholder="worship | bible_study | event"
//                 value={type}
//                 onChange={(e) => setType(e.target.value)}
//                 className="sm:w-[220px]"
//               />
//             </div>

//             <Button
//               onClick={load}
//               disabled={loading}
//               className="w-full sm:w-[110px]"
//             >
//               {loading ? "Loading..." : "Filter"}
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* SUMMARY */}
//       <div className="grid gap-4 sm:grid-cols-3">
//         <Card>
//           <CardHeader>
//             <CardTitle>Total</CardTitle>
//           </CardHeader>
//           <CardContent className="text-3xl font-bold">
//             {summary.total}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Present</CardTitle>
//           </CardHeader>
//           <CardContent className="text-3xl font-bold text-emerald-600">
//             {summary.present}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Absent</CardTitle>
//           </CardHeader>
//           <CardContent className="text-3xl font-bold text-red-600">
//             {summary.absent}
//           </CardContent>
//         </Card>
//       </div>

//       {/* TABLE */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Records</CardTitle>
//         </CardHeader>

//         <CardContent>
//           {/* SEARCH */}
//           <div className="flex items-center justify-between mb-4 gap-3">
//             <Input
//               placeholder="Search member, congregation, or notes..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="max-w-sm"
//             />

//             <p className="text-sm text-slate-500">
//               Showing {paginatedRows.length} of {filteredRows.length}
//             </p>
//           </div>

//           {paginatedRows.length === 0 ? (
//             <p className="text-sm text-slate-500">No records found.</p>
//           ) : (
//             <>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Service</TableHead>
//                     <TableHead>Member</TableHead>
//                     <TableHead>Congregation</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Notes</TableHead>
//                     <TableHead className="w-[80px] text-right">Actions</TableHead>

//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {paginatedRows.map((r) => (
//                     <TableRow key={r.id}>
//                       <TableCell>
//                         {format(new Date(r.date), "MMM d, yyyy")}
//                       </TableCell>
//                       <TableCell className="capitalize">
//                         {r.type}
//                       </TableCell>
//                       <TableCell>
//                         {r.member.lastName}, {r.member.firstName}
//                       </TableCell>
//                       <TableCell>
//                         {r.member.congregation ?? "-"}
//                       </TableCell>
//                       <TableCell
//                         className={
//                           r.status === "present"
//                             ? "text-emerald-600 font-medium"
//                             : "text-red-600 font-medium"
//                         }
//                       >
//                         {r.status === "present" ? "Present" : "Absent"}
//                       </TableCell>
//                       <TableCell>{r.notes ?? "-"}</TableCell>

//                       <TableCell className="text-right">
//                         <Button
//                           size="sm"
//                           variant="destructive"
//                           onClick={async () => {
//                             if (!confirm("Delete this attendance record?")) return;

//                             try {
//                               const res = await fetch(
//                                 `/api/admin/attendance/history/${r.id}`,
//                                 {
//                                   method: "DELETE",
//                                   credentials: "include",
//                                 }
//                               );

//                               if (!res.ok) throw new Error();
//                               toast.success("Attendance deleted");
//                               setRows((prev) => prev.filter((x) => x.id !== r.id));
//                             } catch {
//                               toast.error("Failed to delete record");
//                             }
//                           }}
//                         >
//                           <Trash className="w-4 h-4" />
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>

//               {/* PAGINATION */}
//               <div className="flex items-center justify-between mt-4">
//                 <p className="text-sm text-slate-500">
//                   Page {page} of {totalPages || 1}
//                 </p>

//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     disabled={page === 1}
//                     onClick={() => setPage((p) => p - 1)}
//                   >
//                     Previous
//                   </Button>

//                   <Button
//                     size="sm"
//                     variant="outline"
//                     disabled={page === totalPages || totalPages === 0}
//                     onClick={() => setPage((p) => p + 1)}
//                   >
//                     Next
//                   </Button>
//                 </div>
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { ChevronDown, ChevronRight } from "lucide-react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import React from "react";

// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";

// /* ---------------- TYPES ---------------- */
// type GroupRow = {
//   date: string; // ISO
//   type: string;
//   present: number;
//   absent: number;
//   total: number;
// };

// type Member = {
//   firstName: string;
//   lastName: string;
//   congregation?: string | null;
// };

// type Attendance = {
//   id: number;
//   date: string;
//   status: "present" | "absent";
//   notes?: string | null;
//   member: Member;
// };

// export default function AttendanceHistoryPage() {
//   const [groups, setGroups] = useState<GroupRow[]>([]);
//   const [expanded, setExpanded] = useState<string | null>(null);
//   const [records, setRecords] = useState<Record<string, Attendance[]>>({});
//   const [loadingGroup, setLoadingGroup] = useState<string | null>(null);

//   /* ---------------- LOAD GROUPS ---------------- */
//   async function loadGroups() {
//     try {
//       const res = await fetch("/api/admin/attendance/history", {
//         credentials: "include",
//         cache: "no-store",
//       });
//       if (!res.ok) throw new Error();
//       const data = await res.json();
//       setGroups(data.groupSummary);
//     } catch {
//       toast.error("Failed to load grouped history");
//     }
//   }

//   /* ---------------- LOAD RECORDS PER GROUP ---------------- */
//   async function loadGroupRecords(date: string, type: string) {
//     const key = `${date}_${type}`;
//     if (records[key]) return; // already loaded

//     setLoadingGroup(key);
//     try {
//       const qs = new URLSearchParams({
//         groupDate: date.slice(0, 10),
//         groupType: type,
//         pageSize: "1000",
//       });

//       const res = await fetch(
//         `/api/admin/attendance/history?${qs.toString()}`,
//         { credentials: "include" }
//       );

//       if (!res.ok) throw new Error();
//       const data = await res.json();
//       setRecords((prev) => ({ ...prev, [key]: data.items }));
//     } catch {
//       toast.error("Failed to load records");
//     } finally {
//       setLoadingGroup(null);
//     }
//   }

//   useEffect(() => {
//     loadGroups();
//   }, []);


//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold">Attendance History</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle>Grouped by Date & Service</CardTitle>
//         </CardHeader>

//         <CardContent>
//           {groups.length === 0 ? (
//             <p className="text-sm text-slate-500">No records found.</p>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead />
//                   <TableHead>Date</TableHead>
//                   <TableHead>Service</TableHead>
//                   <TableHead className="text-right">Present</TableHead>
//                   <TableHead className="text-right">Absent</TableHead>
//                   <TableHead className="text-right">Total</TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                   {groups.map((g) => {
//                     const groupKey = `${g.date}_${g.type}`;
//                     const isOpen = expanded === groupKey;

//                     return (
//                       <React.Fragment key={groupKey}>
                       
//                         <TableRow
//                           className="cursor-pointer hover:bg-slate-50"
//                           onClick={() => {
//                             if (isOpen) {
//                               setExpanded(null);
//                             } else {
//                               setExpanded(groupKey);
//                               loadGroupRecords(g.date, g.type);
//                             }
//                           }}
//                         >
//                           <TableCell className="w-[32px]">
//                             {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
//                           </TableCell>

//                           <TableCell>{format(new Date(g.date), "MMM d, yyyy")}</TableCell>
//                           <TableCell className="capitalize">{g.type}</TableCell>

//                           <TableCell className="text-right text-emerald-600 font-medium">
//                             {g.present}
//                           </TableCell>
//                           <TableCell className="text-right text-red-600 font-medium">
//                             {g.absent}
//                           </TableCell>
//                           <TableCell className="text-right font-semibold">
//                             {g.total}
//                           </TableCell>
//                         </TableRow>

                        
//                         {isOpen && (
//                           <TableRow>
//                             <TableCell colSpan={6} className="bg-slate-50">
//                               {loadingGroup === groupKey ? (
//                                 <p className="text-sm text-slate-500 py-2">Loading records…</p>
//                               ) : (
//                                 <Table>
//                                   <TableHeader>
//                                     <TableRow>
//                                       <TableHead>Member</TableHead>
//                                       <TableHead>Congregation</TableHead>
//                                       <TableHead>Status</TableHead>
//                                       <TableHead>Notes</TableHead>
//                                     </TableRow>
//                                   </TableHeader>

//                                   <TableBody>
//                                     {(records[groupKey] ?? []).map((r) => (
//                                       <TableRow key={r.id}>
//                                         <TableCell>
//                                           {r.member.lastName}, {r.member.firstName}
//                                         </TableCell>
//                                         <TableCell>{r.member.congregation ?? "-"}</TableCell>
//                                         <TableCell
//                                           className={
//                                             r.status === "present"
//                                               ? "text-emerald-600 font-medium"
//                                               : "text-red-600 font-medium"
//                                           }
//                                         >
//                                           {r.status}
//                                         </TableCell>
//                                         <TableCell>{r.notes ?? "-"}</TableCell>
//                                       </TableRow>
//                                     ))}
//                                   </TableBody>
//                                 </Table>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         )}
//                       </React.Fragment>
//                     );
//                   })}

//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
