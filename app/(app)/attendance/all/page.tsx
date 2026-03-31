"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CurveWave from "@/components/ui/CurveWave";

type Member = {
  id: number;
  firstName: string;
  lastName: string;
  congregation?: string | null;
};

type AttendanceRecord = {
  id: number;
  date: string;
  type: string;
  status: "present" | "absent";
  notes?: string | null;
};

type MemberAttendanceResponse = {
  member: Member;
  summary: {
    total: number;
    present: number;
    absent: number;
    rate: number;
  };
  records: AttendanceRecord[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export default function AllMembersAttendancePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [history, setHistory] = useState<MemberAttendanceResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const totalPages = history?.pagination?.totalPages || 1;

  const pageNumbers = Array.from(
  { length: Math.min(totalPages, 5) },
    (_, i) => i + 1
    );


  useEffect(() => {
    async function loadMembers() {
      setLoadingMembers(true);
      try {
        const res = await fetch("/api/public/members", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();
        const rows = Array.isArray(data) ? data : [];

        const sorted = rows.sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
        );

        setMembers(sorted);

        if (sorted.length > 0) {
          setSelectedId(sorted[0].id);
        }
      } catch (err) {
        console.error(err);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    }

    loadMembers();
  }, []);

  async function loadHistory(memberId: number) {
    setLoadingHistory(true);
    try {
      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      if (type) qs.set("type", type);

      qs.set("page", String(page));
      qs.set("limit", String(PAGE_SIZE));

      const res = await fetch(
        `/api/public/attendance/member/${memberId}?${qs.toString()}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  }


  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;

    return members.filter((m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
    );
  }, [members, search]);


useEffect(() => {
  if (selectedId) {
    loadHistory(selectedId);
  }
}, [page, selectedId, from, to, type]);

useEffect(() => {
  if (page > totalPages) {
    setPage(totalPages);
  }
}, [totalPages]);

  return (
    <div className="space-y-6 bg-white dark:bg-slate-950">

      {/* HERO SECTION */}
      <section className="relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-20 sm:pt-16">
          <div className="max-w-xl sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Attendance Records
            </h1>

            <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg">
              <span className="block italic">
                “Let all things be done decently and in order.”
              </span>
              <span className="block not-italic mt-1 font-semibold">
                1 Corinthians 14:40 (KJV)
              </span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </section>

      {/* CONTENT */}
      <div className="space-y-6 max-w-7xl mx-auto px-4 pt-10 pb-20">

        <div>
          <h2 className="text-2xl font-bold">All Members Attendance</h2>
          <p className="text-sm text-slate-500">
            Click a member name to view attendance history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          
          {/* LEFT */}
          <Card className="rounded-xl border shadow-lg">
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {loadingMembers ? (
                <p className="text-sm text-slate-500">Loading members...</p>
              ) : filteredMembers.length === 0 ? (
                <p className="text-sm text-slate-500">No members found.</p>
              ) : (
                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {filteredMembers.map((m) => {
                    const active = selectedId === m.id;

                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedId(m.id)}
                        className={`w-full text-left rounded-lg border px-3 py-2 transition ${
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="font-medium">
                          {m.lastName}, {m.firstName}
                        </div>
                        <div className={`text-xs ${active ? "text-blue-100" : "text-slate-500"}`}>
                          {m.congregation ?? "—"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT */}
          <Card className="rounded-xl border shadow-lg">
            <CardHeader>
              <CardTitle>
                {history?.member
                  ? `${history.member.lastName}, ${history.member.firstName}`
                  : "Attendance History"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {/* FILTER */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                <Input
                  placeholder="Type: worship / bible_study / event"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
                <Button disabled={!selectedId || loadingHistory}>
                Auto Apply
                </Button>
              </div>

              {/* SUMMARY */}
              {history?.summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Total" value={history.summary.total} />
                  <Stat label="Present" value={history.summary.present} color="text-green-600" />
                  <Stat label="Absent" value={history.summary.absent} color="text-red-600" />
                  <Stat label="Attendance %" value={`${history.summary.rate}%`} />
                </div>
              )}

              {/* TABLE */}
              {loadingHistory ? (
                <p className="text-sm text-slate-500">Loading history...</p>
              ) : !history || history.records.length === 0 ? (
                <p className="text-sm text-slate-500">No attendance records found.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left px-4 py-3">Date</th>
                        <th className="text-left px-4 py-3">Type</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.records.map((r) => (
                        <tr key={r.id} className="border-t">
                          <td className="px-4 py-3">
                            {format(new Date(r.date), "MMM d, yyyy")}
                          </td>
                          <td className="px-4 py-3 capitalize">
                            {r.type.replaceAll("_", " ")}
                          </td>
                          <td
                            className={`px-4 py-3 font-medium ${
                              r.status === "present"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {r.status}
                          </td>
                          <td className="px-4 py-3">{r.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>

              )}

        {/* PAGINATION */}
            {history && history.records.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-4">

                <div className="text-sm text-slate-500">
                Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-1 flex-wrap">

                {/* PREV */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                >
                    Prev
                </Button>

                {/* PAGE NUMBERS */}
                {pageNumbers.map((num) => (
                    <Button
                    key={num}
                    size="sm"
                    variant={page === num ? "default" : "outline"}
                    onClick={() => setPage(num)}
                    className="px-3"
                    >
                    {num}
                    </Button>
                ))}

                {/* NEXT */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    Next
                </Button>

                </div>
            </div>
            )}

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

/* SMALL COMPONENT */
function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: any;
  color?: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-xl font-bold ${color ?? ""}`}>{value}</div>
    </div>
  );
}