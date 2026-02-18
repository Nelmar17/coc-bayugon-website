"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import CalendarAttendance from "./CalendarAttendance";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Check,
  Filter,
  Calendar,
  CalendarDays,
  Layers,
} from "lucide-react";

/* ---------------------------------------------
 * Types
 * -------------------------------------------- */

type AttendanceItem = {
  date: string; // yyyy-MM-dd
  status: "present" | "absent";
  type: string;
};

type ApiResponse = {
  summary: {
    total: number;
    present: number;
    absent: number;
    rate: number;
  };
  streaks: {
    current: number;
    best: number;
  };
  grouped: Record<string, AttendanceItem[]>; // yyyy-MM
};

type DayDetailsResponse = {
  date: string;
  items: {
    type: string;
    status: string;
    notes?: string | null;
  }[];
};

/* ---------------------------------------------
 * Component
 * -------------------------------------------- */

export default function AttendanceChart() {
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // ✅ CONTROLLED MONTH
  const [range, setRange] = useState<"30" | "90" | "year" | "all">("year");
  const [type, setType] = useState("all");

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // modal
  const [open, setOpen] = useState(false);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [dayDetails, setDayDetails] = useState<DayDetailsResponse | null>(null);
  const [dayLoading, setDayLoading] = useState(false);


  const RANGE_LABEL: Record<string, string> = {
    "30": "Last 30 days",
    "90": "Last 90 days",
    year: "This year",
    all: "All time",
  };

  const TYPE_LABEL: Record<string, string> = {
    all: "All Types",
    worship: "Worship",
    bible_study: "Bible Study",
    event: "Event",
  };


  /* ---------------------------------------------
   * Load attendance
   * -------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/public/me/attendance?year=${year}&range=${range}&type=${type}`,
          { credentials: "include" }
        );
        setData(await res.json());
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [year, range, type]);

  /* ---------------------------------------------
   * 🔑 FIX: FLATTEN grouped (month → day map)
   * -------------------------------------------- */
  const dailyMap = useMemo(() => {
    if (!data) return {};

    const map: Record<string, AttendanceItem[]> = {};

    Object.values(data.grouped).forEach((items) => {
      items.forEach((it) => {
        if (!map[it.date]) map[it.date] = [];
        map[it.date].push(it);
      });
    });

    return map;
  }, [data]);

  /* ---------------------------------------------
   * Open day modal
   * -------------------------------------------- */
  async function openDay(dateStr: string) {
    setActiveDate(dateStr);
    setOpen(true);
    setDayLoading(true);

    try {
      const res = await fetch(
        `/api/public/me/attendance/day?date=${dateStr}&type=${type}`,
        { credentials: "include" }
      );
      setDayDetails(await res.json());
    } finally {
      setDayLoading(false);
    }
  }

  /* ---------------------------------------------
   * UI
   * -------------------------------------------- */
  return (
    <div className="space-y-4 bg-white dark:bg-slate-950">

      {/* ================= CONTROLS ================= */}
       <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {/* TYPE DROPDOWN */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-white dark:bg-slate-950">
                  <Filter className="h-4 w-4 text-slate-500" />
                  {RANGE_LABEL[range]}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Range</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {Object.entries(RANGE_LABEL).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setRange(key as any)}
                    className="flex items-center justify-between"
                  >
                    <span>{label}</span>
                    {range === key && <Check className="h-4 w-4 text-green-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* RANGE DROPDOWN */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-white dark:bg-slate-950">
                  <Filter className="h-4 w-4 text-slate-500" />
                  {RANGE_LABEL[range]}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Range</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {Object.entries(RANGE_LABEL).map(([key, label]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setRange(key as any)}
                    className="flex items-center justify-between"
                  >
                    <span>{label}</span>
                    {range === key && <Check className="h-4 w-4 text-green-600" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* YEAR DROPDOWN */}
            {(range === "year" || range === "all") && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-white dark:bg-slate-950">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {year}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Year</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {Array.from({ length: 6 }).map((_, i) => {
                    const y = now.getFullYear() - i;
                    return (
                      <DropdownMenuItem
                        key={y}
                        onClick={() => setYear(y)}
                        className="flex items-center justify-between"
                      >
                        <span>{y}</span>
                        {year === y && <Check className="h-4 w-4 text-green-600" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {/* MONTH DROPDOWN */}
            {(range === "year" || range === "all") && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm bg-white dark:bg-slate-950">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {format(new Date(year, month, 1), "MMMM")}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                  <DropdownMenuLabel>Month</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {Array.from({ length: 12 }).map((_, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={() => setMonth(i)}
                      className="flex items-center justify-between"
                    >
                      <span>{format(new Date(2024, i, 1), "MMMM")}</span>
                      {month === i && <Check className="h-4 w-4 text-green-600" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
      {/* ================= CONTENT ================= */}
      {loading && <p className="text-sm text-slate-500">Loading attendance…</p>}

      {!loading && data && data.summary.total === 0 && (
        <p className="text-sm text-slate-500">
          No attendance records for this filter.
        </p>
      )}

      {!loading && data && data.summary.total > 0 && (
        <>
          <div className="flex gap-4 text-sm">
            <span>🔥 Current streak: <b>{data.streaks.current}</b></span>
            <span>🏆 Best streak: <b>{data.streaks.best}</b></span>
          </div>

          <Card className="bg-white dark:bg-slate-950">
            <CardContent className="pt-6">
              {(range === "year" || range === "all") && (
                <CalendarAttendance
                  year={year}
                  month={month}
                  days={dailyMap}        // ✅ FIXED
                  onOpenDay={openDay}    // ✅ FIXED
                />
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ================= MODAL ================= */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle>
              {activeDate && format(new Date(activeDate), "MMM d, yyyy")}
            </DialogTitle>
          </DialogHeader>

          {dayLoading && <p className="text-sm text-slate-500">Loading details…</p>}

          {!dayLoading && dayDetails && dayDetails.items.length === 0 && (
            <p className="text-sm text-slate-500">No records on this date.</p>
          )}

          {!dayLoading && dayDetails && dayDetails.items.length > 0 && (
            <div className="space-y-3">
              {dayDetails.items.map((it, i) => (
                <div key={i} className="border rounded-md p-2 text-sm">
                  <div className="flex justify-between">
                    <span className="capitalize">{it.type.replace("_", " ")}</span>  
                    <span
                      className={
                        it.status === "present"
                          ? "text-green-600"
                          : "text-slate-500"
                      }
                    >
                      {it.status}
                    </span>
                  </div>
                  {it.notes && (
                    <div className="text-xs text-slate-500 mt-1">
                      Notes: {it.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}







// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { format } from "date-fns";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import CalendarAttendance from "./CalendarAttendance";

// /* ---------------------------------------------
//  * Types
//  * -------------------------------------------- */

// type AttendanceItem = {
//   date: string; // yyyy-mm-dd
//   status: "present" | "absent";
//   type: string;
// };

// type ApiResponse = {
//   summary: {
//     total: number;
//     present: number;
//     absent: number;
//     rate: number;
//   };
//   streaks: {
//     current: number;
//     best: number;
//   };
//   grouped: Record<string, AttendanceItem[]>;
// };

// type DayDetailsResponse = {
//   date: string;
//   items: {
//     type: string;
//     status: string;
//     notes?: string | null;
//   }[];
// };

// /* ---------------------------------------------
//  * Component
//  * -------------------------------------------- */

// export default function AttendanceChart() {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();

//   const [year, setYear] = useState(currentYear);
//   const [range, setRange] = useState<"30" | "90" | "year" | "all">("year");
//   const [type, setType] = useState("all");

//   const [data, setData] = useState<ApiResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   // modal
//   const [open, setOpen] = useState(false);
//   const [activeDate, setActiveDate] = useState<string | null>(null);
//   const [dayDetails, setDayDetails] = useState<DayDetailsResponse | null>(null);
//   const [dayLoading, setDayLoading] = useState(false);

//   /* ---------------------------------------------
//    * Load attendance data
//    * -------------------------------------------- */
//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `/api/public/me/attendance?year=${year}&range=${range}&type=${type}`,
//           { credentials: "include" }
//         );
//         setData(await res.json());
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, [year, range, type]);

//   /* ---------------------------------------------
//    * Open day modal
//    * -------------------------------------------- */
//   async function openDay(dateStr: string) {
//     setActiveDate(dateStr);
//     setOpen(true);
//     setDayLoading(true);

//     try {
//       const res = await fetch(
//         `/api/public/me/attendance/day?date=${dateStr}&type=${type}`,
//         { credentials: "include" }
//       );
//       setDayDetails(await res.json());
//     } finally {
//       setDayLoading(false);
//     }
//   }

//   /* ---------------------------------------------
//    * UI
//    * -------------------------------------------- */
//   return (
//     <div className="space-y-4">
//       {/* ================= CONTROLS ================= */}
//       <div className="flex flex-wrap gap-2">
//         <Select value={type} onValueChange={setType}>
//           <SelectTrigger className="w-[160px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent className="z-50">
//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="worship">Worship</SelectItem>
//             <SelectItem value="bible_study">Bible Study</SelectItem>
//             <SelectItem value="event">Event</SelectItem>
//           </SelectContent>
//         </Select>

//         <Select value={range} onValueChange={(v) => setRange(v as any)}>
//           <SelectTrigger className="w-[140px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent className="z-50">
//             <SelectItem value="30">Last 30</SelectItem>
//             <SelectItem value="90">Last 90</SelectItem>
//             <SelectItem value="year">This year</SelectItem>
//             <SelectItem value="all">All time</SelectItem>
//           </SelectContent>
//         </Select>

//         {(range === "year" || range === "all") && (
//           <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
//             <SelectTrigger className="w-[120px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent className="z-50">
//               {Array.from({ length: 6 }).map((_, i) => {
//                 const y = currentYear - i;
//                 return (
//                   <SelectItem key={y} value={String(y)}>
//                     {y}
//                   </SelectItem>
//                 );
//               })}
//             </SelectContent>
//           </Select>
//         )}
//       </div>

//       {/* ================= CONTENT ================= */}
//       {loading && (
//         <p className="text-sm text-slate-500">Loading attendance…</p>
//       )}

//       {!loading && data && data.summary.total === 0 && (
//         <p className="text-sm text-slate-500">
//           No attendance records for this filter.
//         </p>
//       )}

//       {!loading && data && data.summary.total > 0 && (
//         <>
//           {/* STREAKS */}
//           <div className="flex gap-4 text-sm">
//             <span>
//               🔥 Current streak: <b>{data.streaks.current}</b>
//             </span>
//             <span>
//               🏆 Best streak: <b>{data.streaks.best}</b>
//             </span>
//           </div>

//           {/* CALENDAR */}
//           <Card>
//             <CardContent className="pt-6">
//               <CalendarAttendance
//                 year={year}
//                 month={currentMonth}
//                 grouped={data.grouped}
//                 onOpenDay={openDay}
//               />
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {/* ================= MODAL ================= */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {activeDate
//                 ? format(new Date(activeDate), "MMMM d, yyyy")
//                 : "Date"}
//             </DialogTitle>
//           </DialogHeader>

//           {dayLoading && (
//             <p className="text-sm text-slate-500">Loading details…</p>
//           )}

//           {!dayLoading && dayDetails && dayDetails.items.length === 0 && (
//             <p className="text-sm text-slate-500">
//               No records on this date.
//             </p>
//           )}

//           {!dayLoading && dayDetails && dayDetails.items.length > 0 && (
//             <div className="space-y-3">
//               {dayDetails.items.map((it, idx) => (
//                 <div key={idx} className="rounded-md border p-2 text-sm">
//                   <div className="flex items-center justify-between">
//                     <span className="capitalize">
//                       {it.type.replace("_", " ")}
//                     </span>
//                     <span
//                       className={`text-xs font-medium px-2 py-0.5 rounded ${
//                         it.status === "present"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-slate-100 text-slate-600"
//                       }`}
//                     >
//                       {it.status}
//                     </span>
//                   </div>

//                   {it.notes && (
//                     <div className="text-xs text-slate-500 mt-1">
//                       Notes: {it.notes}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }




// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { format, startOfYear, endOfYear, startOfWeek, eachDayOfInterval, isSameYear } from "date-fns";

// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   Tooltip,
//   TooltipTrigger,
//   TooltipContent,
// } from "@/components/ui/tooltip";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import CalendarAttendance from "./CalendarAttendance";

// /* ---------------------------------------------
//  * Types (existing)
//  * -------------------------------------------- */

// type AttendanceItem = {
//   date: string;
//   status: "present" | "absent";
//   type: string;
// };

// type ApiResponse = {
//   summary: { total: number; present: number; absent: number; rate: number };
//   streaks: { current: number; best: number };
//   grouped: Record<string, AttendanceItem[]>;
// };

// type HeatmapResponse = {
//   year: number;
//   days: Record<string, { total: number; present: number }>;
// };

// type DayDetailsResponse = {
//   date: string;
//   items: { type: string; status: string; notes?: string | null }[];
// };

// /* ---------------------------------------------
//  * Component
//  * -------------------------------------------- */

// export default function AttendanceChart() {
//   const currentYear = new Date().getFullYear();

//   const [year, setYear] = useState(currentYear);
//   const [range, setRange] = useState<"30" | "90" | "year" | "all">("year");
//   const [type, setType] = useState("all");

//   // existing API (summary + grouped)
//   const [data, setData] = useState<ApiResponse | null>(null);

//   // heatmap API
//   const [heat, setHeat] = useState<HeatmapResponse | null>(null);

//   const [loading, setLoading] = useState(true);

//   // modal
//   const [open, setOpen] = useState(false);
//   const [activeDate, setActiveDate] = useState<string | null>(null);
//   const [dayDetails, setDayDetails] = useState<DayDetailsResponse | null>(null);
//   const [dayLoading, setDayLoading] = useState(false);



  
//   /* ---------------------------------------------
//    * Load main (existing) data
//    * -------------------------------------------- */
//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `/api/public/me/attendance?year=${year}&range=${range}&type=${type}`,
//           { credentials: "include" }
//         );
//         setData(await res.json());
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, [year, range, type]);

//   /* ---------------------------------------------
//    * Load heatmap only for year/all
//    * -------------------------------------------- */
//   useEffect(() => {
//     async function loadHeat() {
//       if (!(range === "year" || range === "all")) {
//         setHeat(null);
//         return;
//       }

//       const y = range === "all" ? year : year;

//       const res = await fetch(
//         `/api/public/me/attendance/heatmap?year=${y}&type=${type}`,
//         { credentials: "include" }
//       );

//       setHeat(await res.json());
//     }

//     loadHeat();
//   }, [range, year, type]);



//   /* ---------------------------------------------
//    * Month bars (your existing collapse view)
//    * -------------------------------------------- */
//   const months = useMemo(() => {
//     if (!data) return [];
//     return Object.entries(data.grouped).map(([key, items]) => {
//       const total = items.length;
//       const present = items.filter((i) => i.status === "present").length;
//       const rate = total ? Math.round((present / total) * 100) : 0;

//       return {
//         key,
//         label: format(new Date(key + "-01"), "MMM yyyy"),
//         rate,
//         total,
//       };
//     });
//   }, [data]);

//   /* ---------------------------------------------
//    * Open day modal
//    * -------------------------------------------- */
//   async function openDay(dateStr: string) {
//     setActiveDate(dateStr);
//     setOpen(true);
//     setDayLoading(true);

//     try {
//       const res = await fetch(
//         `/api/public/me/attendance/day?date=${dateStr}&type=${type}`,
//         { credentials: "include" }
//       );
//       setDayDetails(await res.json());
//     } finally {
//       setDayLoading(false);
//     }
//   }

  

//   /* ---------------------------------------------
//    * UI
//    * -------------------------------------------- */
//   return (
//     <div className="space-y-4">
//       {/* ================= CONTROLS (ALWAYS VISIBLE) ================= */}
//       <div className="flex flex-wrap gap-2">
//         <Select value={type} onValueChange={setType}>
//           <SelectTrigger className="w-[160px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent position="popper" className="z-50">
//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="worship">Worship</SelectItem>
//             <SelectItem value="bible_study">Bible Study</SelectItem>
//             <SelectItem value="event">Event</SelectItem>
//           </SelectContent>
//         </Select>

//         <Select value={range} onValueChange={(v) => setRange(v as any)}>
//           <SelectTrigger className="w-[140px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent position="popper" className="z-50">
//             <SelectItem value="30">Last 30</SelectItem>
//             <SelectItem value="90">Last 90</SelectItem>
//             <SelectItem value="year">This year</SelectItem>
//             <SelectItem value="all">All time</SelectItem>
//           </SelectContent>
//         </Select>

//         {(range === "year" || range === "all") && (
//           <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
//             <SelectTrigger className="w-[120px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent position="popper" className="z-50">
//               {Array.from({ length: 6 }).map((_, i) => {
//                 const y = currentYear - i;
//                 return (
//                   <SelectItem key={y} value={String(y)}>
//                     {y}
//                   </SelectItem>
//                 );
//               })}
//             </SelectContent>
//           </Select>
//         )}
//       </div>

//       {/* ================= CONTENT ================= */}
//       {loading && <p className="text-sm text-slate-500">Loading attendance…</p>}

//       {!loading && data && data.summary.total === 0 && (
//         <p className="text-sm text-slate-500">No attendance records for this filter.</p>
//       )}

//       {!loading && data && data.summary.total > 0 && (
//         <>
//           {/* STREAKS */}
//           <div className="flex gap-4 text-sm">
//             <span>🔥 Current streak: <b>{data.streaks.current}</b></span>
//             <span>🏆 Best streak: <b>{data.streaks.best}</b></span>
//           </div>

//           <Card>
//             <CardContent className="pt-6 space-y-4">
//               {/* 30/90 = DOTS */}
//               {(range === "30" || range === "90") && (
//                 <div className="flex flex-wrap gap-2">
//                   {Object.values(data.grouped).flat().map((d, i) => (
//                     <Tooltip key={i}>
//                       <TooltipTrigger asChild>
//                         <div
//                           className={`h-3 w-3 rounded cursor-default ${
//                             d.status === "present" ? "bg-green-500" : "bg-slate-300"
//                           }`}
//                         />
//                       </TooltipTrigger>
//                       <TooltipContent side="top" className="text-xs">
//                         {format(new Date(d.date), "MMM d, yyyy")}
//                         <div className="text-[10px] text-slate-400 capitalize">
//                           {d.type.replace("_", " ")}
//                         </div>
//                       </TooltipContent>
//                     </Tooltip>
//                   ))}
//                 </div>
//               )}

//               {/* YEAR/ALL = HEATMAP (click → modal) */}
//            {(range === "year" || range === "all") && data && (
//               <CalendarAttendance
//                 year={year}
//                 month={new Date().getMonth()}
//                 grouped={data.grouped}
//                 onOpenDay={openDay}
//               />
//             )}


//               {/* fallback (if you still want month bars somewhere) */}
//               {/* <MonthBars months={months} /> */}
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {/* ================= MODAL ================= */}
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {activeDate ? format(new Date(activeDate), "MMM d, yyyy") : "Date"}
//             </DialogTitle>
//           </DialogHeader>

//           {dayLoading && <p className="text-sm text-slate-500">Loading details…</p>}

//           {!dayLoading && dayDetails && dayDetails.items.length === 0 && (
//             <p className="text-sm text-slate-500">No records on this date.</p>
//           )}

//           {!dayLoading && dayDetails && dayDetails.items.length > 0 && (
//             <div className="space-y-3">
//               {dayDetails.items.map((it, idx) => (
//                 <div key={idx} className="rounded-md border p-2 text-sm">
//                   <div className="flex items-center justify-between">
//                     <span className="capitalize">{it.type.replace("_", " ")}</span>
//                     <span
//                       className={`text-xs font-medium px-2 py-0.5 rounded ${
//                         it.status === "present"
//                           ? "bg-green-100 text-green-700"
//                           : "bg-slate-100 text-slate-600"
//                       }`}
//                     >
//                       {it.status}
//                     </span>
//                   </div>

//                   {it.notes && (
//                     <div className="text-xs text-slate-500 mt-1">
//                       Notes: {it.notes}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// /* ---------------------------------------------
//  * Heatmap Component (GitHub style)
//  * - click day => modal
//  * -------------------------------------------- */

// function Heatmap({
//   year,
//   days,
//   onPickDay,
// }: {
//   year: number;
//   days: Record<string, { total: number; present: number }>;
//   onPickDay: (dateStr: string) => void;
// }) {
//   const yStart = startOfYear(new Date(year, 0, 1));
//   const yEnd = endOfYear(new Date(year, 0, 1));

//   // align to week start (Sunday) to form grid
//   const gridStart = startOfWeek(yStart, { weekStartsOn: 0 });
//   const all = eachDayOfInterval({ start: gridStart, end: yEnd });

//   // group by weeks (columns)
//   const weeks: Date[][] = [];
//   for (let i = 0; i < all.length; i += 7) {
//     weeks.push(all.slice(i, i + 7));
//   }

//   function level(present: number) {
//     // 0 = gray
//     // 1 = light
//     // 2+ = darker (if multiple services/day)
//     if (present <= 0) return 0;
//     if (present === 1) return 1;
//     return 2;
//   }

//   function cellClass(lv: number) {
//     if (lv === 0) return "bg-slate-200";
//     if (lv === 1) return "bg-green-300";
//     return "bg-green-600";
//   }

//   return (
//     <div className="space-y-2">
//       <div className="text-xs text-slate-500">
//         Click a day to view details.
//       </div>

//       <div className="overflow-x-auto">
//         <div className="inline-flex gap-1">
//           {weeks.map((week, wi) => (
//             <div key={wi} className="flex flex-col gap-1">
//               {week.map((d) => {
//                 const inYear = isSameYear(d, new Date(year, 0, 1));
//                 const key = d.toISOString().slice(0, 10);
//                 const stats = days[key];
//                 const lv = inYear ? level(stats?.present ?? 0) : 0;

//                 const title = inYear
//                   ? `${format(d, "MMM d, yyyy")} • Present: ${stats?.present ?? 0} / ${stats?.total ?? 0}`
//                   : "";

//                 return (
//                   <button
//                     key={key}
//                     type="button"
//                     disabled={!inYear}
//                     onClick={() => inYear && onPickDay(key)}
//                     title={title}
//                     className={[
//                       "h-3 w-3 rounded",
//                       inYear ? "cursor-pointer" : "opacity-30 cursor-default",
//                       cellClass(lv),
//                     ].join(" ")}
//                   />
//                 );
//               })}
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="flex items-center gap-2 text-xs text-slate-500">
//         <span>Less</span>
//         <span className="h-3 w-3 rounded bg-slate-200" />
//         <span className="h-3 w-3 rounded bg-green-300" />
//         <span className="h-3 w-3 rounded bg-green-600" />
//         <span>More</span>
//       </div>
//     </div>
//   );
// }




// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { format } from "date-fns";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";


// /* ---------------------------------------------
//  * Types
//  * -------------------------------------------- */

// type AttendanceItem = {
//   date: string;
//   status: "present" | "absent";
//   type: string;
// };

// type ApiResponse = {
//   summary: {
//     total: number;
//     present: number;
//     absent: number;
//     rate: number;
//   };
//   streaks: {
//     current: number;
//     best: number;
//   };
//   grouped: Record<string, AttendanceItem[]>;
// };

// /* ---------------------------------------------
//  * Component
//  * -------------------------------------------- */

// export default function AttendanceChart() {
//   const currentYear = new Date().getFullYear();

//   const [year, setYear] = useState(currentYear);
//   const [range, setRange] = useState<"30" | "90" | "year" | "all">("year");
//   const [type, setType] = useState("all");

//   const [data, setData] = useState<ApiResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `/api/public/me/attendance?year=${year}&range=${range}&type=${type}`,
//           { credentials: "include" }
//         );
//         setData(await res.json());
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, [year, range, type]);

//   const months = useMemo(() => {
//     if (!data) return [];
//     return Object.entries(data.grouped).map(([key, items]) => {
//       const total = items.length;
//       const present = items.filter((i) => i.status === "present").length;
//       const rate = total ? Math.round((present / total) * 100) : 0;

//       return {
//         key,
//         label: format(new Date(key + "-01"), "MMM yyyy"),
//         rate,
//         total,
//       };
//     });
//   }, [data]);

//   return (
//     <div className="space-y-4">
//       {/* ================= CONTROLS (ALWAYS VISIBLE) ================= */}
//       <div className="flex flex-wrap gap-2">
//         <Select value={type} onValueChange={setType}>
//           <SelectTrigger className="w-[160px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent position="item-aligned" className="z-50">

//             <SelectItem value="all">All Types</SelectItem>
//             <SelectItem value="worship">Worship</SelectItem>
//             <SelectItem value="bible_study">Bible Study</SelectItem>
//             <SelectItem value="event">Event</SelectItem>
//           </SelectContent>
//         </Select>

//         <Select value={range} onValueChange={(v) => setRange(v as any)}>
//           <SelectTrigger className="w-[140px]">
//             <SelectValue />
//           </SelectTrigger>
//           <SelectContent position="item-aligned" className="z-50">

//             <SelectItem value="30">Last 30</SelectItem>
//             <SelectItem value="90">Last 90</SelectItem>
//             <SelectItem value="year">This year</SelectItem>
//             <SelectItem value="all">All time</SelectItem>
//           </SelectContent>
//         </Select>

//         {(range === "year" || range === "all") && (
//           <Select
//             value={String(year)}
//             onValueChange={(v) => setYear(Number(v))}
//           >
//             <SelectTrigger className="w-[120px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent position="item-aligned" className="z-50">

//               {Array.from({ length: 6 }).map((_, i) => {
//                 const y = currentYear - i;
//                 return (
//                   <SelectItem key={y} value={String(y)}>
//                     {y}
//                   </SelectItem>
//                 );
//               })}
//             </SelectContent>
//           </Select>
//         )}
//       </div>

//       {/* ================= CONTENT ================= */}
//       {loading && (
//         <p className="text-sm text-slate-500">Loading attendance…</p>
//       )}

//       {!loading && data && data.summary.total === 0 && (
//         <p className="text-sm text-slate-500">
//           No attendance records for this filter.
//         </p>
//       )}

//       {!loading && data && data.summary.total > 0 && (
//         <>
//           {/* STREAKS */}
//           <div className="flex gap-4 text-sm">
//             <span>🔥 Current streak: <b>{data.streaks.current}</b></span>
//             <span>🏆 Best streak: <b>{data.streaks.best}</b></span>
//           </div>

//           {/* CHART */}
//           <Card>
//             <CardContent className="pt-6">
//               {(range === "30" || range === "90") ? (
//            <div className="flex flex-wrap gap-4">
//                 {Object.values(data.grouped)
//                   .flat()
//                   .map((d, i) => (
//                     <div
//                       key={i}
//                       className="flex flex-col items-center gap-1"
//                     >
//                       {/* DOT */}
//                       <div
//                         className={`h-3 w-3 rounded ${
//                           d.status === "present"
//                             ? "bg-green-500"
//                             : "bg-red-400"
//                         }`}
//                       />
//                       {/* DATE */}
//                       <span className="text-[10px] text-slate-500">
//                         {format(new Date(d.date), "MMM d")}
//                       </span>
//                     </div>
//                   ))}
//               </div>
//               ) : (
//                 <div className="space-y-2">
//                   {months.map((m) => (
//                     <div key={m.key}>
//                       <div className="flex justify-between text-xs text-slate-500">
//                         <span>{m.label}</span>
//                         <span>{m.rate}% ({m.total})</span>
//                       </div>
//                       <div className="h-2 w-full bg-slate-200 rounded overflow-hidden">
//                         <div
//                           className="h-full bg-green-500"
//                           style={{ width: `${m.rate}%` }}
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   );
// }

