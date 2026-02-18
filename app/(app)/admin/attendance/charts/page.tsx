"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type AttendanceRow = {
  id: number;
  date: string;
  type: string;
  status: "present" | "absent";
};


export default function AttendanceChartsPage() {
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [service, setService] = useState("worship");
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);



  
  async function load() {
    setLoading(true);
    try {
      const from = `${year}-01-01`;
      const to = `${year}-12-31`;
      const qs = new URLSearchParams({ from, to, type: service });
      //const qs = new URLSearchParams({ from, to, service });

      const res = await fetch(`/api/admin/attendance/history?${qs.toString()}`, 
      { 
        cache: "no-store", credentials: "include",});
      if (!res.ok) throw new Error(await res.text());

      const data = (await res.json()) as any[];
      // strip member payload if any (we only need date/present/service)
            setRows(
            data.map((x) => ({
                id: x.id,
                date: x.date,
                type: x.type,
                status: x.status,
            }))
            );

    } catch (e) {
      console.error(e);
      toast.error("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthly = useMemo(() => {
    // Count PRESENT per month
    const map = new Map<string, number>();
        for (const r of rows) {
        if (r.status !== "present") continue;
        const key = format(new Date(r.date), "yyyy-MM");
        map.set(key, (map.get(key) ?? 0) + 1);
        }


    // Build 12 months
    const out: { month: string; present: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, "0");
      const key = `${year}-${mm}`;
      out.push({ month: key, present: map.get(key) ?? 0 });
    }
    return out;
  }, [rows, year]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance Charts</h1>
          <p className="text-sm text-slate-500">Monthly present counts per service.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">Year</span>
            <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" />
          </div>
          <div className="grid gap-1">
            <span className="text-xs text-slate-500">Service</span>
            <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="worship" />
          </div>
          <Button onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card className="rounded-xl border shadow-lg bg-white dark:bg-slate-950/50 border-blue-100 px-2 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle>Monthly Present</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="present" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}






// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { toast } from "sonner";
// import { format } from "date-fns";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";

// /* ---------------- TYPES ---------------- */
// type AttendanceRow = {
//   id: number;
//   date: string;
//   type: string;
//   status: "present" | "absent";
// };

// /* ---------------- SERVICE LABELS ---------------- */
// const SERVICE_LABEL: Record<string, string> = {
//   worship: "Worship",
//   bible_study: "Bible Study",
//   event: "Event",
// };

// export default function AttendanceChartsPage() {
//   const [year, setYear] = useState(String(new Date().getFullYear()));
//   const [service, setService] =
//     useState<keyof typeof SERVICE_LABEL>("worship");
//   const [rows, setRows] = useState<AttendanceRow[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ✅ CHART SAFETY (FIX width/height -1 ERROR) */
//   const containerRef = useRef<HTMLDivElement | null>(null);
//   const [ready, setReady] = useState(false);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     const el = containerRef.current;
//     const ro = new ResizeObserver((entries) => {
//       const { width, height } = entries[0].contentRect;
//       if (width > 0 && height > 0) setReady(true);
//     });

//     ro.observe(el);
//     return () => ro.disconnect();
//   }, []);

//   /* ---------------- LOAD DATA ---------------- */
//   async function load() {
//     setLoading(true);
//     try {
//       const from = `${year}-01-01`;
//       const to = `${year}-12-31`;

//       const qs = new URLSearchParams({
//         from,
//         to,
//         type: service,
//         pageSize: "10000",
//       });

//       const res = await fetch(
//         `/api/admin/attendance/history?${qs.toString()}`,
//         {
//           cache: "no-store",
//           credentials: "include",
//         }
//       );

//       if (!res.ok) throw new Error(await res.text());

//       const data = await res.json();

//       setRows(
//         (data.items ?? []).map((x: any) => ({
//           id: x.id,
//           date: x.date,
//           type: x.type,
//           status: x.status,
//         }))
//       );
//     } catch (e) {
//       console.error(e);
//       toast.error("Failed to load chart data");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ---------------- MONTHLY AGGREGATION ---------------- */
//   const monthly = useMemo(() => {
//     const map = new Map<string, number>();

//     for (const r of rows) {
//       if (r.status !== "present") continue;
//       const key = format(new Date(r.date), "yyyy-MM");
//       map.set(key, (map.get(key) ?? 0) + 1);
//     }

//     const out: { month: string; present: number }[] = [];
//     for (let m = 1; m <= 12; m++) {
//       const mm = String(m).padStart(2, "0");
//       const key = `${year}-${mm}`;
//       out.push({ month: key, present: map.get(key) ?? 0 });
//     }
//     return out;
//   }, [rows, year]);

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">Attendance Charts</h1>
//           <p className="text-sm text-slate-500">
//             Monthly present counts per service
//           </p>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           <div className="grid gap-1">
//             <span className="text-xs text-slate-500">Year</span>
//             <Input
//               value={year}
//               onChange={(e) => setYear(e.target.value)}
//               placeholder="2025"
//               className="w-[120px]"
//             />
//           </div>

//           <div className="grid gap-1">
//             <span className="text-xs text-slate-500">Service</span>
//             <Select
//               value={service}
//               onValueChange={(v) =>
//                 setService(v as keyof typeof SERVICE_LABEL)
//               }
//             >
//               <SelectTrigger className="w-[160px]">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="worship">Worship</SelectItem>
//                 <SelectItem value="bible_study">Bible Study</SelectItem>
//                 <SelectItem value="event">Event</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           <Button onClick={load} disabled={loading} className="self-end">
//             {loading ? "Loading..." : "Refresh"}
//           </Button>
//         </div>
//       </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>
//                 Monthly Present — {SERVICE_LABEL[service]}
//               </CardTitle>
//             </CardHeader>

//             <CardContent>
//               <div className="w-full overflow-x-auto">
//                 <LineChart
//                   width={800}
//                   height={360}
//                   data={monthly}
//                   style={{ width: "100%" }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis allowDecimals={false} />
//                   <Tooltip />
//                   <Line
//                     type="monotone"
//                     dataKey="present"
//                     strokeWidth={2}
//                   />
//                 </LineChart>
//               </div>
//             </CardContent>
//           </Card>

//     </div>
//   );
// }
