"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";

type WeeklyItem = {
  id: number;
  day: string;
  title: string;
  time: string;
};

const DAY_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function WeeklyScheduleCard({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [items, setItems] = useState<WeeklyItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/weekly-schedule");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Failed to load weekly schedule:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= AUTO HIGHLIGHT TODAY ================= */
  const todayName = DAY_ORDER[new Date().getDay()];

  const grouped = DAY_ORDER.map((day) => ({
    day,
    items: items.filter((i) => i.day === day),
  })).filter((g) => g.items.length > 0);

  return (
    <Card
      
      className={cn(
        compact ? "p-6 sm:p-8" : "p-8 sm:p-12",
        "relative overflow-hidden",
        "bg-white/60 dark:bg-slate-950/40",
        "backdrop-blur-lg",
        "shadow-xl", "dark:shadow-none",
        "border border-slate-200/80 dark:border-slate-800",
        "rounded-2xl",
        "transition-all duration-300"
      )}
    >
      {/* BULLETIN BOARD STYLE BACKGROUND LAYER */}
      {/* <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('/paper-texture.png')]" /> */}

      {/* HEADER */}
      <div className="text-center mb-10 space-y-3 relative">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Schedule of Services
        </h2>

        {!compact && (
          <p className="text-slate-800 dark:text-slate-400">
            Sitio Bayugon, Brgy. Tinitian, Roxas, Palawan
          </p>
        )}

        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4" />
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Loading schedule…</p>
      ) : (
        <div className="space-y-8 relative">
          {grouped.map((group) => {
            const isToday = group.day === todayName;

            return (
              <div
                key={group.day}
                className={cn(
                  "p-6 rounded-xl border transition-all duration-300",
                  // "backdrop-blur-md",
               isToday
                  ? "bg-blue-50/40 dark:bg-blue-900/40  border-blue-400 shadow-md"
                  : "bg-blue-50/20 dark:bg-blue-900/20  border-slate-200 shadow-sm hover:shadow-lg dark:border-slate-800 hover:bg-blue-500/8"

                )}
              >
                {/* DAY HEADER WITH ICON */}
                <div className="flex items-center gap-2 mb-5">
                  <CalendarDays
                    className={cn(
                      "w-4 h-4",
                      isToday
                        ? "text-blue-700 dark:text-blue-600"
                        : "text-salte-600"
                    )}
                  />
                  <h3
                    className={cn(
                      "text-lg font-semibold",
                      isToday && "text-blue-700 dark:text-blue-300"
                    )}
                  >
                    {group.day}
                    {isToday && (
                      <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-600 text-white">
                        Today
                      </span>
                    )}
                  </h3>
                </div>

                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 group"
                    >
                      {/* TITLE */}
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.title}
                      </span>

                      {/* TIME BADGE WITH CLOCK ICON */}
                      <span className="flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 transition-all duration-200 group-hover:scale-105">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* FOOTER QUOTE */}
          {!compact && (
            <div className="py-4 text-center">
              <p className="italic text-xl font-medium text-red-600 dark:text-yellow-400">
                “Visitors are welcome, members are expected.”
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}






// "use client";

// import { useEffect, useState } from "react";
// import { cn } from "@/lib/utils";
// import { Card } from "@/components/ui/card";


// type WeeklyItem = {
//   id: number;
//   day: string;
//   title: string;
//   time: string;
// };

// const DAY_ORDER = [
//   "Sunday",
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];

// export default function WeeklyScheduleCard({
//   compact = false,
// }: {
//   compact?: boolean; // 👈 homepage vs full page
// }) {
//   const [items, setItems] = useState<WeeklyItem[]>([]);
//   const [loading, setLoading] = useState(true);
  

// useEffect(() => {
//   async function load() {
//     try {
//       const res = await fetch("/api/weekly-schedule");

//       if (!res.ok) {
//         throw new Error(`HTTP ${res.status}`);
//       }

//       const data = await res.json();
//       setItems(data);
//     } catch (err) {
//       console.error("Failed to load weekly schedule:", err);
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   load();
// }, []);


//   const grouped = DAY_ORDER.map((day) => ({
//     day,
//     items: items.filter((i) => i.day === day),
//   })).filter((g) => g.items.length > 0);

// return (
//         <Card
//               variant="static"
//           className={cn(
//             "p-8 sm:p-12",
//             "bg-white/70 dark:bg-slate-950/60",
//             "backdrop-blur-xl",
//             "shadow-2xl",
//             "border border-white/40 dark:border-slate-800",
//             "rounded-2xl",
//             "transition-all duration-300"
//           )}
//         >
//           {/* HEADER */}
//           <div className="text-center mb-10 space-y-2">
//             <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
//               Schedule of Services
//             </h2>

//             <p className="text-slate-500 dark:text-slate-400">
//               Sitio Bayugon, Brgy. Tinitian, Roxas, Palawan
//             </p>

//             <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full mt-4" />
//           </div>

//           {loading ? (
//             <p className="text-center text-slate-500">Loading schedule…</p>
//           ) : (
//             <div className="space-y-8">
//               {grouped.map((group, i) => (
//                 <div
//                   key={group.day}
//                   className={cn(
//                     "p-6 rounded-xl border transition",
//                     group.day === "Sunday"
//                       ? "bg-blue-50/20 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
//                       : "bg-slate-50/20 dark:bg-slate-900/20 border-blue-200 dark:border-slate-800"
//                   )}

//                 >
//                   {/* DAY HEADER */}
//                   <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
//                     {group.day}
//                   </h3>

//                   <div className="space-y-4">
//                     {group.items.map((item) => (
//                       <div
//                         key={item.id}
//                         className="flex items-center justify-between gap-4"
//                       >
//                         {/* TITLE */}
//                         <span className="font-medium text-slate-800 dark:text-slate-200">
//                           {item.title}
//                         </span>

//                         {/* TIME BADGE */}
//                         <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
//                           {item.time}
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}

//               {/* FOOTER QUOTE */}
//               <div className="pt-6 text-center">
//                 <p className="italic text-lg font-medium text-red-600 dark:text-yellow-400">
//                   “Visitors are welcome, members are expected.”
//                 </p>
//               </div>
//             </div>
//           )}
//         </Card>
//       );
//   }









// return (
//       <Card
//         variant="static"
//         className={cn(
//           "p-6 sm:p-10",
//           "bg-white/60 dark:bg-slate-900/60",
//           "backdrop-blur-md",
//           "w-full max-w-full"
//         )}
//       >
//     {/* HEADER */}
//     <div className="mb-4">
//       <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-950 dark:text-slate-50">
//         Schedule of Services
//       </h2>

//       <p className="text-base sm:text-lg mt-1 text-slate-900 text-center dark:text-slate-100">
//         Sitio Bayugon, Brgy. Tinitian, Roxas, Palawan
//       </p>
//     </div>

//     {loading ? (
//       <p className="text-sm text-slate-500">Loading schedule…</p>
//     ) : (
//       <div className="space-y-4">
//         {grouped.map((group, i) => (
//           <div
//             key={group.day}
//             className="spy-section"
//             style={{ animationDelay: `${i * 80}ms` }}
//           >
//             {/* DAY */}
//             <div className="font-bold text-lg text-slate-900 dark:text-slate-200 mb-3">
//               {group.day}
//             </div>

//             <div className="space-y-2">
//               {group.items.map((item) => (
//                 <div
//                   key={item.id}
//                   className="relative pl-4 py-2 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     {/* TITLE */}
//                     <span className="text-base font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
//                       {item.title}
//                     </span>

//                     {/* DASH */}
//                     <div className="flex-1 border-b border-dashed border-slate-800/70 dark:border-slate-500/70" />

//                     {/* TIME */}
//                     <span className="text-base font-semibold text-slate-900 dark:text-slate-300 whitespace-nowrap">
//                       {item.time}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}

//         {/* FOOTER QUOTE */}
//         <div className="pt-3 pb-4">
//           <h2 className="text-base sm:text-xl font-medium italic text-center text-red-600 dark:text-yellow-500">
//             " VISITORS ARE WELCOME, MEMBERS ARE EXPECTED! "
//           </h2>
//         </div>
//       </div>
//     )}
//   </Card>
// );