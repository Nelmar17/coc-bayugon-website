"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import CurveWave from "@/components/ui/CurveWave";
import { motion, type Variants } from "framer-motion";
import {
  ChevronsRight,
  Megaphone,
  CalendarClock,
  Pin,
} from "lucide-react";

/* ================= ANIMATION ================= */

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

/* ================= HELPERS ================= */

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalize(text: string) {
  return text.toLowerCase().trim();
}

/* ================= PAGE ================= */

export default function SermonsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  const MotionLink = motion(Link);

  /* ================= FETCH ================= */

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/sermons", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (alive) setSermons(data ?? []);
      } catch {
        if (alive) setSermons([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  /* ================= URL FILTER STATE ================= */

  const year = searchParams.get("year") ?? "all";
  const preacher = searchParams.get("preacher") ?? "all";
  const category = searchParams.get("category") ?? "all";

  function updateFilter(y: string, p: string, c: string) {
    const params = new URLSearchParams();
    if (y !== "all") params.set("year", y);
    if (p !== "all") params.set("preacher", p);
    if (c !== "all") params.set("category", c);
    router.push(`?${params.toString()}`, { scroll: false });
    setVisibleCount(6);
  }

  /* ================= FILTER OPTIONS ================= */

  const years = useMemo(() => {
    const set = new Set<string>();
    sermons.forEach((s) => {
      if (s.date) set.add(new Date(s.date).getFullYear().toString());
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [sermons]);

  const preachers = useMemo(() => {
    const set = new Set<string>();
    sermons.forEach((s) => {
      if (s.preacher) set.add(s.preacher.trim());
    });
    return Array.from(set).sort();
  }, [sermons]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    sermons.forEach((s) => {
      if (!s.category) return;
      const key = normalize(s.category);
      if (!map.has(key)) map.set(key, s.category.trim());
    });
    return Array.from(map.values()).sort();
  }, [sermons]);

  /* ================= FILTER + LOAD MORE ================= */

  const filteredSermons = useMemo(() => {
    return sermons
      .filter((s) => {
        const matchYear =
          year === "all" ||
          (s.date && new Date(s.date).getFullYear().toString() === year);

        const matchPreacher = preacher === "all" || s.preacher === preacher;

        const matchCategory =
          category === "all" ||
          (s.category && normalize(s.category) === normalize(category));

        return matchYear && matchPreacher && matchCategory;
      })
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [sermons, year, preacher, category]);

  const visibleSermons = filteredSermons.slice(0, visibleCount);

  const latestSermonId = useMemo(() => {
    if (filteredSermons.length === 0) return null;

    return [...filteredSermons].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0].id;
  }, [filteredSermons]);

  /* ================= RENDER ================= */

  return (
    <div className="space-y-16 bg-white dark:bg-slate-950">
      {/* HEADER */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative h-[32vh] sm:h-[45vh] md:h-[40vh] min-h-[300px] sm:min-h-[340px] overflow-hidden"
      >
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
          style={{ backgroundImage: "url('/church-contact.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-4 sm:pt-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Sermons
            </h1>
            <p className="pt-3 text-slate-200 text-lg">
              Watch, listen, and download sermon resources.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </motion.section>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 pb-28 space-y-6">
        {/* INTRO */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-4 pb-16 py-4 text-center space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            Proclaiming the Word of God
          </h2>

          <p className="text-lg text-slate-700 dark:text-slate-300">
            Our sermons are centered on the faithful proclamation of God’s Word.
            Through preaching, Scripture is taught, applied, and declared so that
            hearts may be instructed, corrected, and encouraged to live according
            to God’s will.
          </p>

          <blockquote className="italic text-lg text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
            “Preach the word; be instant in season, out of season; reprove,
            rebuke, exhort with all longsuffering and doctrine.”
            <span className="block not-italic mt-2 text-md font-medium text-slate-800 dark:text-slate-200">
              — 2 Timothy 4:2 (KJV)
            </span>
          </blockquote>
        </motion.section>

        {/* HEADER TEXT */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-2 text-center md:text-left"
        >
          <h1 className="text-3xl font-bold">Messages from God’s Word</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Explore sermon lessons taught from Scripture, with outlines, videos,
            and downloadable materials.
          </p>
        </motion.header>

        {/* FILTERS */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 items-center rounded-2xl p-4
                      bg-white/70 dark:bg-slate-900/80
                      backdrop-blur-xl border border-blue-400/20"
        >
          <select
            value={year}
            onChange={(e) => updateFilter(e.target.value, preacher, category)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <select
            value={preacher}
            onChange={(e) => updateFilter(year, e.target.value, category)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Preachers</option>
            {preachers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => updateFilter(year, preacher, e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <span className="ml-auto text-xs text-slate-500">
            {filteredSermons.length} results
          </span>
        </motion.div>

        {/* GRID */}
        {loading ? (
          <p className="pt-10 text-center text-slate-500">Loading…</p>
        ) : visibleSermons.length === 0 ? (
              <div className="py-16 text-center">
                  <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                       No sermons found.
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      We’ll be adding sermons soon. Please check back later.
                    </p>
                  </div>
                </div>
        ) : (
          <>
            <div className="grid pt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleSermons.map((s) => {
                const daysDiff =
                  s.date
                    ? Math.max(
                        0,
                        (Date.now() - new Date(s.date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : Infinity;

                const showLatest =
                  s.id === latestSermonId && daysDiff <= 7;

                return (
                  <MotionLink
                    key={s.id}
                    href={`/sermons/${s.id}-${toSlug(s.title)}`}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 220, damping: 26 }}
                    className="relative rounded-xl
                      bg-slate-50 dark:bg-slate-900
                        shadow-xl
                        hover:shadow-2xl
                        transition-shadow
                        duration-300
                        ease-out
                        overflow-hidden"
                  >
                    {s.isPinned && (
                      <span
                        className="absolute top-3 right-3 z-10
                            inline-flex items-center gap-1.5
                            rounded-full
                            bg-amber-500/90 text-white
                            text-xs font-semibold
                            px-3 py-1
                            shadow-md"
                      >
                        <Pin className="w-4 h-4" /> Pinned
                      </span>
                    )}

                    {showLatest && (
                      <span className="absolute top-3 left-3 z-10 rounded-full bg-sky-600/80 text-white text-xs font-semibold px-3 py-1 shadow-md">
                        Latest Sermon
                      </span>
                    )}

                    {s.imageUrl && (
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="w-full aspect-[16/9] object-cover"
                      />
                    )}

                    <div className="p-6 space-y-3 pt-3">
                      <h2 className="font-semibold text-lg line-clamp-2">
                        {s.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="w-4 h-4" />
                          {format(new Date(s.date), "MMM d, yyyy")}
                        </span>

                        {s.preacher && (
                          <span className="inline-flex items-center gap-1">
                            <Megaphone className="w-4 h-4" />
                            {s.preacher}
                          </span>
                        )}
                      </div>

                      {s.description && (
                        <span className="text-md text-slate-600 dark:text-slate-300 line-clamp-2">
                          {s.description}
                        </span>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        {s.category && (
                          <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-slate-800">
                            {s.category}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-0.4 text-sm text-blue-600 font-medium">
                          View Sermon{" "}
                          <ChevronsRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </MotionLink>
                );
              })}
            </div>

            {/* LOAD MORE */}
            {visibleCount < filteredSermons.length && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center pt-12"
              >
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="rounded-full px-6 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Load more sermons
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
