"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type AttendanceType = "worship" | "bible_study" | "event";
type AttendanceStatus = "present" | "absent";

type Member = {
  id: number;
  firstName: string;
  lastName: string;
};

type Row = {
  member: Member;
  status: AttendanceStatus;
  notes: string;
};

export default function AdminAttendancePage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [type, setType] = useState<AttendanceType>("worship");

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteTarget, setNoteTarget] = useState<Row | null>(null);
  const [noteText, setNoteText] = useState("");

  const [originalDate, setOriginalDate] = useState(date);
  const [originalType, setOriginalType] = useState(type);
// 🔒 confirm move modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState<null | (() => void)>(null);


  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ date, type });
      const res = await fetch(`/api/admin/attendance?${qs.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message ?? "Failed to load attendance");
        return;
      }

      const data = await res.json();
      setRows(
        (data.items ?? []).map((x: any) => ({
          member: x.member,
          status: x.status,
          notes: x.notes ?? "",
        }))
      );
      // setOriginalDate(date);
      // setOriginalType(type);
    } catch (e) {
      console.error(e);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, type]);

  function toggle(memberId: number, checked: boolean) {
    setRows((prev) =>
      prev.map((r) =>
        r.member.id === memberId
          ? { ...r, status: checked ? "present" : "absent" }
          : r
      )
    );
  }

  function openNotes(r: Row) {
    setNoteTarget(r);
    setNoteText(r.notes ?? "");
    setNoteOpen(true);
  }


async function saveAttendance() {
  // 🚫 PREVENT FUTURE DATE
  const selected = new Date(date);
  const today = new Date();
  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selected > today) {
    toast.error("Cannot save attendance for a future date");
    return;
  }

  const moved = date !== originalDate || type !== originalType;

  const doSave = async () => {
    setSaving(true);
    try {
          const payload = moved
        ? {
            fromDate: originalDate,
            fromType: originalType,
            toDate: date,
            toType: type,
            items: rows.map((r) => ({
              memberId: r.member.id,
              status: r.status,
              notes: r.notes || "",
            })),
          }
        : {
            date,
            type,
            items: rows.map((r) => ({
              memberId: r.member.id,
              status: r.status,
              notes: r.notes || "",
            })),
          };

      const res = await fetch("/api/admin/attendance", {
        method: moved ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message ?? "Failed to save attendance");
        return;
      }

      toast.success(
        moved
          ? "Attendance date/service updated successfully"
          : "Attendance saved"
      );

      setOriginalDate(date);
      setOriginalType(type);
    } catch (e) {
      console.error(e);
      toast.error("Server error");
    } finally {
      setSaving(false);
      setConfirmOpen(false);
      setPendingSave(null);
    }
  };

  // 🔒 CONFIRM MOVE
  if (moved) {
    setPendingSave(() => doSave);
    setConfirmOpen(true);
  } else {
    doSave();
  }
}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Attendance</h2>
        <p className="text-sm text-slate-500">
          Mark attendance for church members
        </p>
      </div>

      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
          <div>
            <Label>Service</Label>
            <Select value={type} onValueChange={(v) => setType(v as AttendanceType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worship">Worship Service</SelectItem>
                <SelectItem value="bible_study">Bible Study</SelectItem>
                <SelectItem value="event">Special Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={saveAttendance}
              disabled={saving || loading}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500">No members found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center w-[120px]">
                    Present
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    Notes
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.member.id}>
                    <TableCell>
                      {r.member.lastName}, {r.member.firstName}
                    </TableCell>

                    <TableCell className="w-[120px]">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={r.status === "present"}
                          onCheckedChange={(v) =>
                            toggle(r.member.id, Boolean(v))
                          }
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openNotes(r)}
                        title={r.notes ? "Edit notes" : "Add notes"}
                      >
                        <Pencil
                          className={`w-4 h-4 ${
                            r.notes ? "text-blue-600" : "text-slate-500"
                          }`}
                        />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* NOTES DIALOG */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
              <DialogTitle>
                Notes —{" "}
                {noteTarget
                  ? `${noteTarget.member.lastName}, ${noteTarget.member.firstName}`
                  : ""}
              </DialogTitle>

              <DialogDescription>
                Add or edit notes for this member’s attendance.
              </DialogDescription>
            </DialogHeader>


          <div className="space-y-3">
            <Label>Notes</Label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Type notes here..."
              className="min-h-[140px]"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setNoteOpen(false);
                  setNoteTarget(null);
                  setNoteText("");
                }}
              >
                Cancel
              </Button>

              <Button
                onClick={async () => {
                  if (!noteTarget) return;

                  // update local rows
                  const updatedRows = rows.map((x) =>
                    x.member.id === noteTarget.member.id
                      ? { ...x, notes: noteText }
                      : x
                  );

                  setRows(updatedRows);

                  // 🔥 AUTO SAVE TO DB
                  try {
                    const res = await fetch("/api/admin/attendance", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        date,
                        type,
                        items: updatedRows.map((r) => ({
                          memberId: r.member.id,
                          status: r.status,
                          notes: r.notes || "",
                        })),
                      }),
                    });

                    if (!res.ok) throw new Error();

                    toast.success("Notes saved");
                  } catch {
                    toast.error("Failed to save notes");
                  }

                  setNoteOpen(false);
                  setNoteTarget(null);
                  setNoteText("");
                }}
              >
                Save Notes
              </Button>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CONFIRM MOVE DIALOG */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Attendance Update</DialogTitle>
            <DialogDescription>
              You changed the attendance date or service.
              This will move all existing attendance records
              to the new date/service.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setPendingSave(null);
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={() => {
                pendingSave?.();
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}





// "use client";

// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { format } from "date-fns";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Pencil } from "lucide-react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";

// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// type AttendanceType = "worship" | "bible_study" | "event";
// type AttendanceStatus = "present" | "absent";

// type Member = {
//   id: number;
//   firstName: string;
//   lastName: string;
// };

// type Row = {
//   member: Member;
//   status: AttendanceStatus;
//   notes: string;
// };

// export default function AdminAttendancePage() {
//   const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
//   const [type, setType] = useState<AttendanceType>("worship");

//   const [rows, setRows] = useState<Row[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [noteOpen, setNoteOpen] = useState(false);
//   const [noteTarget, setNoteTarget] = useState<Row | null>(null);
//   const [noteText, setNoteText] = useState("");

//   async function load() {
//     setLoading(true);
//     try {
//       const qs = new URLSearchParams({ date, type });
//       const res = await fetch(`/api/admin/attendance?${qs.toString()}`, {
//         cache: "no-store",
//         credentials: "include",
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         toast.error(err.message ?? "Failed to load attendance");
//         return;
//       }

//       const data = await res.json();
//       setRows(
//         (data.items ?? []).map((x: any) => ({
//           member: x.member,
//           status: x.status,
//           notes: x.notes ?? "",
//         }))
//       );
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [date, type]);

//   function toggle(memberId: number, checked: boolean) {
//     setRows((prev) =>
//       prev.map((r) =>
//         r.member.id === memberId
//           ? { ...r, status: checked ? "present" : "absent" }
//           : r
//       )
//     );
//   }

//   function openNotes(r: Row) {
//     setNoteTarget(r);
//     setNoteText(r.notes ?? "");
//     setNoteOpen(true);
//   }

//   async function saveAttendance() {
//     setSaving(true);
//     try {
//       const res = await fetch("/api/admin/attendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           date,
//           type,
//           items: rows.map((r) => ({
//             memberId: r.member.id,
//             status: r.status,
//             notes: r.notes || "",
//           })),
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         toast.error(err.message ?? "Failed to save attendance");
//         return;
//       }

//       toast.success("Attendance saved!");
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error");
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold">Attendance</h2>
//         <p className="text-sm text-slate-500">
//           Mark attendance for church members
//         </p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Attendance Details</CardTitle>
//         </CardHeader>

//         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <Label>Date</Label>
//             <Input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//             />
//           </div>

//           <div>
//             <Label>Service</Label>
//             <Select value={type} onValueChange={(v) => setType(v as AttendanceType)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select service" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="worship">Worship Service</SelectItem>
//                 <SelectItem value="bible_study">Bible Study</SelectItem>
//                 <SelectItem value="event">Special Event</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="flex items-end">
//             <Button
//               onClick={saveAttendance}
//               disabled={saving || loading}
//               className="w-full"
//             >
//               {saving ? "Saving..." : "Save Attendance"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Members</CardTitle>
//         </CardHeader>

//         <CardContent>
//           {loading ? (
//             <p className="text-sm text-slate-500">Loading...</p>
//           ) : rows.length === 0 ? (
//             <p className="text-sm text-slate-500">No members found</p>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Name</TableHead>
//                   <TableHead className="text-center w-[120px]">
//                     Present
//                   </TableHead>
//                   <TableHead className="text-center w-[80px]">
//                     Notes
//                   </TableHead>
//                 </TableRow>
//               </TableHeader>

//               <TableBody>
//                 {rows.map((r) => (
//                   <TableRow key={r.member.id}>
//                     <TableCell>
//                       {r.member.lastName}, {r.member.firstName}
//                     </TableCell>

//                     <TableCell className="w-[120px]">
//                       <div className="flex justify-center items-center">
//                         <Checkbox
//                           checked={r.status === "present"}
//                           onCheckedChange={(v) =>
//                             toggle(r.member.id, Boolean(v))
//                           }
//                         />
//                       </div>
//                     </TableCell>

//                     <TableCell className="text-center">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => openNotes(r)}
//                         title={r.notes ? "Edit notes" : "Add notes"}
//                       >
//                         <Pencil
//                           className={`w-4 h-4 ${
//                             r.notes ? "text-blue-600" : "text-slate-500"
//                           }`}
//                         />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>

//       {/* NOTES DIALOG */}
//       <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
//         <DialogContent className="sm:max-w-[520px]">
//       <DialogHeader>
//               <DialogTitle>
//                 Notes —{" "}
//                 {noteTarget
//                   ? `${noteTarget.member.lastName}, ${noteTarget.member.firstName}`
//                   : ""}
//               </DialogTitle>

//               <DialogDescription>
//                 Add or edit notes for this member’s attendance.
//               </DialogDescription>
//             </DialogHeader>


//           <div className="space-y-3">
//             <Label>Notes</Label>
//             <Textarea
//               value={noteText}
//               onChange={(e) => setNoteText(e.target.value)}
//               placeholder="Type notes here..."
//               className="min-h-[140px]"
//             />

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setNoteOpen(false);
//                   setNoteTarget(null);
//                   setNoteText("");
//                 }}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 onClick={async () => {
//                   if (!noteTarget) return;

//                   // update local rows
//                   const updatedRows = rows.map((x) =>
//                     x.member.id === noteTarget.member.id
//                       ? { ...x, notes: noteText }
//                       : x
//                   );

//                   setRows(updatedRows);

//                   // 🔥 AUTO SAVE TO DB
//                   try {
//                     const res = await fetch("/api/admin/attendance", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       credentials: "include",
//                       body: JSON.stringify({
//                         date,
//                         type,
//                         items: updatedRows.map((r) => ({
//                           memberId: r.member.id,
//                           status: r.status,
//                           notes: r.notes || "",
//                         })),
//                       }),
//                     });

//                     if (!res.ok) throw new Error();

//                     toast.success("Notes saved");
//                   } catch {
//                     toast.error("Failed to save notes");
//                   }

//                   setNoteOpen(false);
//                   setNoteTarget(null);
//                   setNoteText("");
//                 }}
//               >
//                 Save Notes
//               </Button>

//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
