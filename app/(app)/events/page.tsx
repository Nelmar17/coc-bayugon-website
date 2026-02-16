"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { formatTimeRange } from "@/lib/datetime";
import { ChevronsRight } from "lucide-react";
import CurveWave from "@/components/ui/CurveWave";
import { motion, type Variants } from "framer-motion";


type EventItem = {
  id: number;
  title: string;
  description?: string | null;
  location?: string | null;
  imageUrl?: string | null; 
  eventDate: string;
  endDate?: string | null;
  isFeatured: boolean;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};


export default function EventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [search, setSearch] = useState("");

  useEffect(() => {
      async function load() {
        try {
          const res = await fetch(`/api/events?type=${tab}`, { cache: "no-store" });
          const data = await res.json();
          setItems(data);
        } catch (e) {
          console.error(e);
          setItems([]);
        } finally {
          setLoading(false);
        }
      }
    load();
}, [tab]);


  const today = startOfDay(new Date());

  const filtered = useMemo(() => {
  const q = search.toLowerCase().trim();

  return [...items]
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .filter((e) => {
      if (!q) return true;

      const hay = [e.title, e.location, e.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
}, [items, search]);

const featured = useMemo(() => {
  if (filtered.length === 0) return null;

  return (
    filtered.find((e) => e.isFeatured) ??
    filtered[0] ??
    null
  );
}, [filtered]);


  return (
    <div className="space-y-12">
      {/* HERO (covers navbar like contact) */}
      <section className="relative h-[55vh] min-h-[280px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-sm"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
        <div className="space-y-3">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-5xl font-bold text-white"
          >
            Special Events
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="text-slate-200 text-lg"
          >
            Upcoming gatherings & announcements
          </motion.p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(["upcoming", "past", "all"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm border transition",
                    "bg-white/10 text-white border-white/30 hover:bg-white/15",
                    tab === k && "bg-white text-slate-900 border-white"
                  )}
                >
                  {k === "upcoming" ? "Upcoming" : k === "past" ? "Past" : "All"}
                </button>
              ))}
            </div>

            <div className="mt-3 flex justify-center">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="w-full max-w-md px-4 py-2 rounded-xl bg-white/15 text-white placeholder:text-white/70 border border-white/30 outline-none"
              />
            </div>
          </div>
        </div>
      <div className="absolute bottom-0 left-0 w-full pointer-events-none">
           <CurveWave />
    </div>   
      </section>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 pb-24 space-y-8 -mt-16 relative z-20">
        {loading ? (
          <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/60 p-6">
            <p className="text-sm text-slate-500">Loading events…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white/80 dark:bg-slate-900/60 p-6">
            <p className="text-md text-slate-500">No events found.</p>
          </div>
        ) : (
          <>
            {/* FEATURED */}
            {featured && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Link
                  href={`/events/${featured.id}`}
                  className="block rounded-2xl border overflow-hidden shadow-lg bg-white/80 dark:bg-slate-900/60 backdrop-blur hover:shadow-xl transition"
                >
                <div className="grid md:grid-cols-2">
                  <div className="relative h-56 md:h-full">
                    <img
                      src={featured.imageUrl || "/church-contact.jpg"}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt={featured.title}
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute top-4 left-4 text-xs px-2 py-1 rounded-full bg-blue-600 text-white">
                      Featured
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {featured.title}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {format(new Date(featured.eventDate), "MMMM d, yyyy")} •{" "}
                      {formatTimeRange(featured.eventDate, featured.endDate)}
                    </p>
                    {featured.location && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        📍 {featured.location}
                      </p>
                    )}
                    {featured.description && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 mt-2">
                        {featured.description}
                      </p>
                    )}
                    <div className="pt-2 inline-flex items-center gap-1 text-md font-semibold text-yellow-600 hover:text-yellow-500">
                      View details <ChevronsRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

            {/* GRID */}
            <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
              {filtered.map((e) => {
                const d = new Date(e.eventDate);
                const isPast = d < today;

                return (
                       <motion.div
                        key={e.id}
                        variants={fadeUp}
                        whileHover={{ scale: 1.02, y: -4 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="h-full"
                      >
                                                <Link
                            href={`/events/${e.id}`}
                            className="
                              block h-full
                              rounded-2xl
                              border
                              overflow-hidden
                              bg-white/80
                              dark:bg-slate-900/60
                              backdrop-blur
                              shadow
                              hover:shadow-lg
                              transition
                            "
                          >
                            <div className="relative h-44">
                              <img
                                src={e.imageUrl || "/church-contact.jpg"}
                                className="absolute inset-0 w-full h-full object-cover"
                                alt={e.title}
                              />
                              <div className="absolute inset-0 bg-black/25" />

                              <div
                                className={cn(
                                  "absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full",
                                  isPast
                                    ? "bg-amber-200 text-amber-900"
                                    : "bg-emerald-200 text-emerald-900"
                                )}
                              >
                                {isPast ? "Past" : "Upcoming"}
                              </div>

                              {e.isFeatured && (
                                <div className="absolute top-3 right-3 text-[11px] px-2 py-1 rounded-full bg-blue-600 text-white">
                                  Featured
                                </div>
                              )}
                            </div>

                            <div className="p-6 space-y-2">
                              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                                {e.title}
                              </h3>

                              <p className="text-md text-slate-600 dark:text-slate-300">
                                {format(d, "MMM d, yyyy")} •{" "}
                                {formatTimeRange(e.eventDate, e.endDate)}
                              </p>

                              {e.location && (
                                <p className="text-md text-slate-600 dark:text-slate-300 line-clamp-1">
                                  📍 {e.location}
                                </p>
                              )}
                            </div>
                          </Link>
                        </motion.div>
                     );
                  })} 
               </motion.div>
            </>
           )}
        </div>
    </div>
  );
}
