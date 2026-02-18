"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import WeeklyScheduleCard from "@/components/WeeklyScheduleCard";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isSameDay, startOfDay } from "date-fns";
import { motion, Variants, useScroll, useTransform } from "framer-motion";
import CurveWave from "@/components/ui/CurveWave";
import WhatToExpect from "@/components/WhatToExpect";

/* ---------------------------------------------
   HELPERS
---------------------------------------------- */

function formatTimeRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = new Date(start);
  const startTime = format(s, "h:mm a");

  if (!end) return startTime;

  const e = new Date(end);
  const endTime = format(e, "h:mm a");

  return `${startTime} – ${endTime}`;
}

function IconClock() {
  return (
    <svg
      className="w-4 h-4 text-slate-700 dark:text-slate-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      className="w-4 h-4 text-slate-700 dark:text-slate-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.121 17.804A4 4 0 0110 15h4a4 4 0 014.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function IconLocation() {
  return (
    <svg
      className="w-4 h-4 text-slate-700 dark:text-slate-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.428 15.341A8 8 0 104.572 15.34L12 21l7.428-5.659z"
      />
    </svg>
  );
}

function recurrenceBadgePublic(r?: string | null) {
  if (!r) return null;

  let label = r;
  let className =
    "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

  if (r === "WEEKLY") {
    label = "Weekly";
    className =
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
  }

  if (r === "MONTHLY_LAST") {
    label = "Monthly (Last Week)";
    className =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }

  return (
    <span
      className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${className}`}
    >
      {label}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1], // ✅ easeOut equivalent
    },
  },
};

const weeklyCardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // smooth easeOut
    },
  },
};


type Schedule = {
  id: number;
  title?: string | null;
  day: string;
  serviceName: string;
  preacher?: string | null;
  location?: string | null;
  eventDate?: string | null;
  endDate?: string | null;
  recurrence?: string | null;
  createdAt: string;
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [dayFilter, setDayFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [preacherFilter, setPreacherFilter] = useState("All");
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();


  /* LOAD schedules */
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/schedules", { cache: "no-store" });
      const data = await res.json();
      setSchedules(data);
      setLoading(false);
    }
    load();
  }, []);


  /* FILTERS */
  const uniqueDays = [...new Set(schedules.map((s) => s.day))];
  const uniqueLocations = [...new Set(schedules.map((s) => s.location || ""))].filter(
    Boolean
  );
  const uniquePreachers = [...new Set(schedules.map((s) => s.preacher || ""))].filter(
    Boolean
  );

  /* FILTERED RESULTS */
  const filtered = useMemo(() => {
    const today = startOfDay(new Date());

    return schedules
      .slice()
      .sort((a, b) => {
        const A = new Date(a.eventDate || a.createdAt).getTime();
        const B = new Date(b.eventDate || b.createdAt).getTime();
        return A - B;
      })
      .filter((s) => {
        const date = new Date(s.eventDate || s.createdAt);

        if (tab === "upcoming" && date < today) return false;
        if (tab === "past" && date >= today) return false;

        if (selectedDate && !isSameDay(date, selectedDate)) return false;
        if (dayFilter !== "All" && s.day !== dayFilter) return false;
        if (locationFilter !== "All" && s.location !== locationFilter) return false;
        if (preacherFilter !== "All" && s.preacher !== preacherFilter) return false;

        if (search) {
          const hay = [
            s.title,
            s.serviceName,
            s.preacher,
            s.location,
            s.day,
            s.endDate,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!hay.includes(search.toLowerCase())) return false;
        }

        return true;
      });
  }, [schedules, tab, selectedDate, dayFilter, locationFilter, preacherFilter, search]);

    /* GROUP BY DATE */
    const grouped = useMemo(() => {
      const out: Record<string, Schedule[]> = {};
      filtered.forEach((s) => {
        const key = format(new Date(s.eventDate || s.createdAt), "yyyy-MM-dd");
        if (!out[key]) out[key] = [];
        out[key].push(s);
      });
      return out;
    }, [filtered]);

    const today = startOfDay(new Date());
    const upcomingCount = schedules.filter(
      (s) => new Date(s.eventDate || s.createdAt) >= today
    ).length;
    const pastCount = schedules.filter(
      (s) => new Date(s.eventDate || s.createdAt) < today
    ).length;

return (
  <div className="bg-white dark:bg-slate-950">

    {/* ================= HERO ================= */}
    <section className="relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
        style={{ backgroundImage: "url('/admin-main-header.jpg')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex items-center justify-center h-full text-center px-4 ">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Join Us for Worship
          </h1>
          <p className="pt-2 text-slate-200">
            Bayugon Church of Christ
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
        <CurveWave />
      </div>
    </section>


    {/* ================= MAIN GRID LAYOUT ================= */}
    <div className="max-w-7xl mx-auto px-4 py-16">

      <div className="grid lg:grid-cols-3 gap-12">

        {/* ================================================= */}
        {/* LEFT SIDE — TIMELINE (PRIMARY CONTENT) */}
        {/* ================================================= */}
        <div className="lg:col-span-2 space-y-10">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            Service Timeline
          </motion.h1>

          {/* TABS */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastCount})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({schedules.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* SEARCH + FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full dark:bg-slate-800 dark:border-slate-700"
              />
            </div>

            <div className="hidden sm:block lg:col-span-1">
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option>All</option>
                {uniqueLocations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="hidden sm:block lg:col-span-1">
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700"
                value={preacherFilter}
                onChange={(e) => setPreacherFilter(e.target.value)}
              >
                <option>All</option>
                {uniquePreachers.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    {selectedDate ? format(selectedDate, "PPP") : "Filter Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                  <Button
                    className="mt-2 w-full"
                    variant="ghost"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="relative">
            {!loading && Object.keys(grouped).length > 0 && (
              <div className="absolute left-3 top-0 bottom-0 w-px bg-violet-300/50 dark:bg-violet-400/30" />
            )}

            <motion.div
              className="pl-10 space-y-10"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {loading ? (

                /* ================= LOADING STATE ================= */
                <div className="py-16 text-center">
                  <p className="text-slate-600 dark:text-slate-400">
                    Loading timeline...
                  </p>
                </div>

              ) : Object.keys(grouped).length === 0 ? (

                /* ================= EMPTY STATE ================= */
                <div className="py-16 text-center">
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      No Available Timeline
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      There are no scheduled services at the moment.
                    </p>
                  </div>
                </div>

              ) : (

                /* ================= NORMAL TIMELINE ================= */
                Object.entries(grouped).map(([key, items]) => {
                  const date = new Date(key);
                  const isToday = isSameDay(date, new Date());

                  return (
                    <div key={key} className="space-y-3">
                      <div className="py-2 px-1 mt-10">
                        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-200">
                          {isToday ? "Today" : format(date, "MMMM d, yyyy")}
                        </h3>
                      </div>
                      {items.map((s) => (
                        <motion.div
                          key={s.id}
                          variants={itemVariants}                                           
                          initial="hidden"
                          whileInView="visible"
                          viewport={{ once: true }}
                          whileHover={{ y: -6 }}
                          transition={{ type: "spring", stiffness: 220, damping: 26 }}
                          className="relative"
                            >
                          <Link href={`/schedules/${s.id}`} className="block">
                            <div className="p-5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 border-blue-400/20
                                            shadow-lg hover:shadow-xl transition-shadow duration-300 ease-out hover:border-blue-400">
                              <h2 className="text-xl font-semibold">
                                {s.title || s.serviceName}
                              </h2>
                                <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                  <p>
                                    {s.day} • {formatTimeRange(s.eventDate, s.endDate)}
                                  </p>
                                  {s.preacher && <p>{s.preacher}</p>}
                                  {s.location && <p>{s.location}</p>}
                                </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  );
                })
              )}
            </motion.div>
          </div>
        </div>


        {/* ================================================= */}
        {/* RIGHT SIDE — SIDEBAR */}
        {/* ================================================= */}
        <div className="space-y-8">

          <div className="sticky top-24 space-y-8">

            {/* Weekly Schedule */}
            <WeeklyScheduleCard />

            {/* Verse Card */}
            <div className="
              p-6
              rounded-2xl
              bg-white/70 dark:bg-slate-950/60
              backdrop-blur-xl
              border border-white/40 dark:border-slate-800
              shadow-xl
            ">
              <p className="text-lg italic leading-relaxed text-slate-800 dark:text-slate-200">
                “Seek ye first the kingdom of God, and his righteousness;
                and all these things shall be added unto you.”
              </p>

              <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                — Matthew 6:33 (KJV)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <WhatToExpect compact />
  </div>
);

}
















// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import Link from "next/link";
// import WeeklyScheduleCard from "@/components/WeeklyScheduleCard";
// import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import { format, isSameDay, startOfDay } from "date-fns";
// import { motion, Variants, useScroll, useTransform } from "framer-motion";
// import CurveWave from "@/components/ui/CurveWave";
// import WhatToExpect from "@/components/WhatToExpect";

// /* ---------------------------------------------
//    HELPERS
// ---------------------------------------------- */

// function formatTimeRange(start?: string | null, end?: string | null) {
//   if (!start) return "";
//   const s = new Date(start);
//   const startTime = format(s, "h:mm a");

//   if (!end) return startTime;

//   const e = new Date(end);
//   const endTime = format(e, "h:mm a");

//   return `${startTime} – ${endTime}`;
// }

// function IconClock() {
//   return (
//     <svg
//       className="w-4 h-4 text-slate-700 dark:text-slate-300"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       viewBox="0 0 24 24"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//       />
//     </svg>
//   );
// }


// function IconUser() {
//   return (
//     <svg
//       className="w-4 h-4 text-slate-700 dark:text-slate-300"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       viewBox="0 0 24 24"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M5.121 17.804A4 4 0 0110 15h4a4 4 0 014.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
//       />
//     </svg>
//   );
// }


// function IconLocation() {
//   return (
//     <svg
//       className="w-4 h-4 text-slate-700 dark:text-slate-300"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       viewBox="0 0 24 24"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z"
//       />
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M19.428 15.341A8 8 0 104.572 15.34L12 21l7.428-5.659z"
//       />
//     </svg>
//   );
// }

// function recurrenceBadgePublic(r?: string | null) {
//   if (!r) return null;

//   let label = r;
//   let className =
//     "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

//   if (r === "WEEKLY") {
//     label = "Weekly";
//     className =
//       "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";
//   }

//   if (r === "MONTHLY_LAST") {
//     label = "Monthly (Last Week)";
//     className =
//       "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
//   }

//   return (
//     <span
//       className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${className}`}
//     >
//       {label}
//     </span>
//   );
// }

// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.08,
//     },
//   },
// };

// const itemVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 30,
//     scale: 0.98,
//   },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       duration: 0.45,
//       ease: [0.16, 1, 0.3, 1], // ✅ easeOut equivalent
//     },
//   },
// };

// const weeklyCardVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 40,
//     scale: 0.96,
//   },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       duration: 0.6,
//       ease: [0.16, 1, 0.3, 1], // smooth easeOut
//     },
//   },
// };


// type Schedule = {
//   id: number;
//   title?: string | null;
//   day: string;
//   serviceName: string;
//   preacher?: string | null;
//   location?: string | null;
//   eventDate?: string | null;
//   endDate?: string | null;
//   recurrence?: string | null;
//   createdAt: string;
// };

// export default function SchedulesPage() {
//   const [schedules, setSchedules] = useState<Schedule[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [dayFilter, setDayFilter] = useState("All");
//   const [locationFilter, setLocationFilter] = useState("All");
//   const [preacherFilter, setPreacherFilter] = useState("All");
//   const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>();


//   /* LOAD schedules */
//   useEffect(() => {
//     async function load() {
//       const res = await fetch("/api/schedules", { cache: "no-store" });
//       const data = await res.json();
//       setSchedules(data);
//       setLoading(false);
//     }
//     load();
//   }, []);


//   /* FILTERS */
//   const uniqueDays = [...new Set(schedules.map((s) => s.day))];
//   const uniqueLocations = [...new Set(schedules.map((s) => s.location || ""))].filter(
//     Boolean
//   );
//   const uniquePreachers = [...new Set(schedules.map((s) => s.preacher || ""))].filter(
//     Boolean
//   );

//   /* FILTERED RESULTS */
//   const filtered = useMemo(() => {
//     const today = startOfDay(new Date());

//     return schedules
//       .slice()
//       .sort((a, b) => {
//         const A = new Date(a.eventDate || a.createdAt).getTime();
//         const B = new Date(b.eventDate || b.createdAt).getTime();
//         return A - B;
//       })
//       .filter((s) => {
//         const date = new Date(s.eventDate || s.createdAt);

//         if (tab === "upcoming" && date < today) return false;
//         if (tab === "past" && date >= today) return false;

//         if (selectedDate && !isSameDay(date, selectedDate)) return false;
//         if (dayFilter !== "All" && s.day !== dayFilter) return false;
//         if (locationFilter !== "All" && s.location !== locationFilter) return false;
//         if (preacherFilter !== "All" && s.preacher !== preacherFilter) return false;

//         if (search) {
//           const hay = [
//             s.title,
//             s.serviceName,
//             s.preacher,
//             s.location,
//             s.day,
//             s.endDate,
//           ]
//             .filter(Boolean)
//             .join(" ")
//             .toLowerCase();
//           if (!hay.includes(search.toLowerCase())) return false;
//         }

//         return true;
//       });
//   }, [schedules, tab, selectedDate, dayFilter, locationFilter, preacherFilter, search]);

//   /* GROUP BY DATE */
//   const grouped = useMemo(() => {
//     const out: Record<string, Schedule[]> = {};
//     filtered.forEach((s) => {
//       const key = format(new Date(s.eventDate || s.createdAt), "yyyy-MM-dd");
//       if (!out[key]) out[key] = [];
//       out[key].push(s);
//     });
//     return out;
//   }, [filtered]);

//   const today = startOfDay(new Date());
//   const upcomingCount = schedules.filter(
//     (s) => new Date(s.eventDate || s.createdAt) >= today
//   ).length;
//   const pastCount = schedules.filter(
//     (s) => new Date(s.eventDate || s.createdAt) < today
//   ).length;

//   return (
//     <div className="space-y-16 bg-white dark:bg-slate-950 ">
//       {/* ================= HERO + WEEKLY CARD WRAPPER ================= */}
//      <div className="relative ">

//         {/* HERO HEADER */}
//       <section className=" relative h-[28vh] sm:h-[45vh] md:h-[40vh] min-h-[380px] sm:min-h-[320px] -mt-16 overflow-hidden">
//         {/* Background Image */}
//         <div className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
//           style={{ backgroundImage: "url('/admin-main-header.jpg')", }}/>

//                 {/* OVERLAY */}
//                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />

//             <div className="absolute inset-0 bg-black/60" />

//               <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-2 md:hidden sm:pt-16">
//                 <div className="max-w-xl sm:max-w-2xl mx-auto">
//                 <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//                    Join Us for Worship
//                 </h1>
//                 <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
//                   Bayugon Church of Christ
//                   </p>
//                </div>
//              </div>
//            <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//                 <CurveWave />
//          </div>   
//       </section>

// <motion.div
//   className="relative z-30 w-full -mt-20 md:-mt-24 px-4"
//   variants={weeklyCardVariants}
//   initial="hidden"
//   whileInView="show"
//   viewport={{ once: true, margin: "-80px" }}
// >
//   <div className="max-w-7xl mx-auto w-full grid md:grid-cols-3 gap-6 items-start">

//     {/* LEFT — Weekly Schedule */}
//     <div className="md:col-span-2">
//       <WeeklyScheduleCard />
//     </div>

//     <div className="md:col-span-1">
//       <div className="
//         p-6 sm:p-8
//         rounded-2xl
//         bg-white/70 dark:bg-slate-950/60
//         backdrop-blur-xl
//         border border-white/40 dark:border-slate-800
//         shadow-xl
//         h-full
//         flex flex-col justify-center
//       ">
//         <p className="text-lg italic text-slate-800 dark:text-slate-200 leading-relaxed">
//           “Seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.”
//         </p>

//         <p className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
//           — Matthew 6:33 (KJV)
//         </p>
//       </div>
//     </div>

//   </div>
// </motion.div>

//     </div>

//       {/* ================= TIMELINE CONTENT ================= */}
//       <div
//         className={cn(
//           "max-w-6xl mx-auto px-4 pb-20 relative z-20 space-y-8",
//           "pt-2 sm:pt-10", // responsive spacing so it won’t clash w/ card
//         )}
//       >

//     <div className="relative space-y-10 sm:space-y-12">

//         {/* HEADER */}
//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-3xl sm:text-4xl text-center text-slate-900 dark:text-slate-100 font-bold tracking-tight"
//         >
//           Service Timeline
//         </motion.h1>

//         {/* TABS */}
//         <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
//           <TabsList className="w-full grid grid-cols-3">
//             <TabsTrigger value="upcoming">Upcoming ({upcomingCount})</TabsTrigger>
//             <TabsTrigger value="past">Past ({pastCount})</TabsTrigger>
//             <TabsTrigger value="all">All ({schedules.length})</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </div>
//          {/* SEARCH + FILTERS (RESPONSIVE GRID) */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
//             {/* LABEL – hide on mobile */}
//             <div className="hidden sm:block lg:col-span-1">
//               <Label className="text-md dark:text-slate-400">Search</Label>
//             </div>

//             {/* SEARCH – always visible */}
//             <div className="lg:col-span-2">
//               <Input
//                 placeholder="Search..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
//               />
//             </div>

//             {/* LOCATION – hide on mobile */}
//             <div className="hidden sm:block lg:col-span-1">
//               <select
//                 className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
//                 value={locationFilter}
//                 onChange={(e) => setLocationFilter(e.target.value)}
//               >
//                 <option>All</option>
//                 {uniqueLocations.map((l) => (
//                   <option key={l}>{l}</option>
//                 ))}
//               </select>
//             </div>

//             {/* PREACHER – hide on mobile */}
//             <div className="hidden sm:block lg:col-span-1">
//               <select
//                 className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
//                 value={preacherFilter}
//                 onChange={(e) => setPreacherFilter(e.target.value)}
//               >
//                 <option>All</option>
//                 {uniquePreachers.map((p) => (
//                   <option key={p}>{p}</option>
//                 ))}
//               </select>
//             </div>

//             {/* DATE FILTER – always visible */}
//             <div className="lg:col-span-1">
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button variant="outline" size="sm" className="w-full justify-start">
//                     {selectedDate ? format(selectedDate, "PPP") : "Filter Date"}
//                   </Button>
//                 </PopoverTrigger>

//                 <PopoverContent className="w-auto p-3">
//                   <Calendar
//                     mode="single"
//                     selected={selectedDate}
//                     onSelect={setSelectedDate}
//                   />
//                   <Button
//                     className="mt-2 text-md w-full"
//                     variant="ghost"
//                     onClick={() => setSelectedDate(undefined)}
//                   >
//                     Clear
//                   </Button>
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//         {/* TIMELINE */}
//         <div className="relative">
//           <div className="absolute left-3 top-0 bottom-0 w-px bg-violet-300/50 dark:bg-violet-400/30" />

//           <motion.div
//             className="pl-10 space-y-10"
//             variants={containerVariants}
//             initial="hidden"
//             animate="show"
//           >

//             {Object.entries(grouped).map(([key, items]) => {
//               const date = new Date(key);
//               const isToday = isSameDay(date, new Date());

//               return (
//                 <div key={key} className="space-y-3">
//                   <div className="py-2 px-1 mt-10">
//                     <div className="flex flex-wrap items-center gap-3">
//                       <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-200">
//                         {isToday ? "Today" : format(date, "MMMM d, yyyy")}
//                       </h3>

//                       {isToday && (
//                         <span className="text-md bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
//                           🔥 Today’s Events
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {items.map((s, i) => (
//                       <motion.div
//                         key={s.id}
//                         variants={itemVariants}
//                         initial="hidden"
//                         whileInView="show"
//                         viewport={{ once: true, margin: "-80px" }}
//                         className="relative will-change-transform"
//                       >
//                       <Link href={`/schedules/${s.id}`} className="block focus:outline-none">
//                         <div
//                           className={cn(
//                             "relative event-card p-5 sm:p-6 rounded-2xl border cursor-pointer",
//                             "bg-white dark:bg-slate-900",
//                             "border-blue-500/60 dark:border-blue-400/60",
//                             "shadow-md hover:shadow-lg",
//                             "opacity-100 filter-none backdrop-filter-none",
//                             "transition-all duration-300 transform hover:scale-[1.01]",
//                             "w-full max-w-3xl mx-auto" // ✅ centered + safe on mobile
//                           )}
//                         >
//                           {/* Triangle (hide on mobile to prevent overflow) */}
//                           <div
//                               className="
//                                 absolute left-0 top-5
//                                 w-0 h-0
//                                 -translate-x-full
//                                 border-t-[6px] border-b-[6px] border-r-[10px]
//                                 border-t-transparent
//                                 border-b-transparent
//                                 border-r-blue-500/60
//                                 dark:border-r-blue-400/60
//                                 sm:border-t-[8px] sm:border-b-[8px] sm:border-r-[12px]
//                               "
//                             />

//                           {/* <div
//                             className="
//                               hidden sm:block
//                               absolute left-0 top-6
//                               w-0 h-0
//                               -translate-x-full
//                               border-t-[8px] border-b-[8px] border-r-[12px]
//                               border-t-transparent
//                               border-b-transparent
//                               border-r-blue-500/70
//                               dark:border-r-blue-400/70
//                             "
//                           /> */}

//                           <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 break-words">
//                             {s.title || s.serviceName}
//                           </h2>

//                           {s.recurrence && <div className="mt-1">{recurrenceBadgePublic(s.recurrence)}</div>}

//                           <div className="mt-2 space-y-1 text-slate-800 dark:text-slate-300 text-sm sm:text-md">
//                             <p className="flex items-center gap-2">
//                               <IconClock /> {s.day} • {formatTimeRange(s.eventDate, s.endDate)}
//                             </p>

//                             {s.preacher && (
//                               <p className="flex items-center gap-2">
//                                 <IconUser /> {s.preacher}
//                               </p>
//                             )}

//                             {s.location && (
//                               <p className="flex items-center gap-2">
//                                 <IconLocation /> {s.location}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </Link>
//                     </motion.div>
//                   ))}
//                 </div>
//               );
//             })}
//           </motion.div>
//         </div> 
//       </div>
//      <WhatToExpect compact />
//     </div>
//   );
// }









