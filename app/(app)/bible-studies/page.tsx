"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import CurveWave from "@/components/ui/CurveWave";
import { motion, type Variants } from "framer-motion";
import { ChevronsRight, Megaphone, CalendarClock, Pin } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function toSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Category = {
  id: number;
  name: string;
};

type BibleStudy = {
  id: number;
  title: string;
  speaker?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  studyDate: string;
  isPinned?: boolean;
  category?: Category | null;
};

function BibleStudiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<BibleStudy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [error, setError] = useState<string | null>(null);

  const year = searchParams.get("year") ?? "all";
  const preacher = searchParams.get("preacher") ?? "all";
  const selectedCategory = searchParams.get("category");

  function updateFilter(nextYear: string, nextPreacher: string) {
    const params = new URLSearchParams(searchParams.toString());
    nextYear === "all" ? params.delete("year") : params.set("year", nextYear);
    nextPreacher === "all"
      ? params.delete("preacher")
      : params.set("preacher", nextPreacher);

    router.push(`?${params.toString()}`, { scroll: false });
    setVisibleCount(6);
  }

  // Data fetching with error handling
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const qs = new URLSearchParams();
        if (selectedCategory) qs.set("category", selectedCategory);

        const [itemsRes, catRes] = await Promise.all([
          fetch(`/api/bible-studies?${qs.toString()}`, { cache: "no-store" }),
          fetch(`/api/categories`, { cache: "no-store" }),
        ]);

        if (!itemsRes.ok || !catRes.ok) throw new Error("Failed to fetch data");

        const [itemsData, catData] = await Promise.all([
          itemsRes.json(),
          catRes.json(),
        ]);

        if (!alive) return;
        setItems(itemsData ?? []);
        setCategories(catData ?? []);
      } catch (err) {
        if (!alive) return;
        setItems([]);
        setCategories([]);
        setError("Failed to load Bible Studies. Please try again later.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [selectedCategory]);

  const years = useMemo(() => {
    const set = new Set<string>();
    items.forEach((b) => set.add(new Date(b.studyDate).getFullYear().toString()));
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [items]);

  const preachers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((b) => b.speaker && set.add(b.speaker));
    return Array.from(set).sort();
  }, [items]);


  const filtered = useMemo(() => {
  return items
    .filter((b) => {
      const matchYear =
        year === "all" || new Date(b.studyDate).getFullYear().toString() === year;
      const matchPreacher = preacher === "all" || b.speaker === preacher;
      const matchCategory = !selectedCategory || String(b.category?.id) === selectedCategory; // Fix comparison
      return matchYear && matchPreacher && matchCategory;
    })
    .sort(
      (a, b) =>
        new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime()
    );
}, [items, year, preacher, selectedCategory]);


  // const filtered = useMemo(() => {
  //   return items
  //     .filter((b) => {
  //       const matchYear =
  //         year === "all" || new Date(b.studyDate).getFullYear().toString() === year;
  //       const matchPreacher = preacher === "all" || b.speaker === preacher;
  //       return matchYear && matchPreacher;
  //     })
  //     .sort(
  //       (a, b) =>
  //         new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime()
  //     );
  // }, [items, year, preacher]);

  const pinnedStudies = filtered.filter((b) => b.isPinned);
  const normalStudies = filtered.filter((b) => !b.isPinned);
  const combined = [...pinnedStudies, ...normalStudies];
  const visibleItems = combined.slice(0, visibleCount);

  const latestByDateId = useMemo(() => {
    if (filtered.length === 0) return null;

    return [...filtered].sort(
      (a, b) =>
        new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime()
    )[0].id;
  }, [filtered]);

  return (
    <div className="space-y-16 bg-white dark:bg-slate-950">
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
          <div className="max-w-xl sm:max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Bible Studies
            </h1>
            <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg">
              Watch, listen, and download Bible Study sessions.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full pointer-events-none">
          <CurveWave />
        </div>
      </motion.section>

      {/* Display error message if there is one */}
      {error && <p className="pt-10 text-center text-red-600">{error}</p>}

      <div className="max-w-7xl mx-auto px-4 pb-28 space-y-6">
        {/* INTRO */}
        <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-6xl mx-auto text-center space-y-6"
            >
            <h2 className="text-2xl md:text-3xl font-bold">
              Rooted in the Word of God
           </h2>
              <p className="text-lg text-slate-700 dark:text-slate-300">
                Our Bible studies are centered on the Word of God, seeking understanding,
                growth, and faithful living through Scripture.
              </p>
            <blockquote className="italic text-lg text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
                 “All scripture is given by inspiration of God, and is profitable for doctrine,
                  for reproof, for correction, for instruction in righteousness:
                That the man of God may be perfect, throughly furnished unto all good works.”
                  <span className="block not-italic mt-2 text-md font-medium text-slate-800 dark:text-slate-200">
                    — 2 Timothy 3:16–17 (KJV) 
                  </span>
            </blockquote>
        </motion.section>

        {/* HEADER */}
          <motion.header
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-2 text-center pt-12 md:text-left"
            >
           <h2 className="text-3xl font-bold">Bible Study Sessions</h2>
            <p className="text-slate-600 dark:text-slate-400">
             Explore Bible Study lessons taught from Scripture, with downloadable materials.
            </p>
        </motion.header>

        {/* YEAR + PREACHER (AUTO) */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 items-center rounded-2xl p-4 bg-white/70 dark:bg-slate-900/80 border-blue-400/20 backdrop-blur-xl border"
        >
          <select
            value={year}
            onChange={(e) => updateFilter(e.target.value, preacher)}
            className="rounded-xl border border-blue-400/20 px-3 py-2 text-sm"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={preacher}
            onChange={(e) => updateFilter(year, e.target.value)}
            className="rounded-xl border border-blue-400/20 px-3 py-2 text-sm"
          >
            <option value="all">All Preachers</option>
            {preachers.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <span className="ml-auto text-xs text-slate-500">
            {filtered.length} results
          </span>
        </motion.div>

        {/* CATEGORY */}

        {categories.length > 0 && (
          <div className="flex pt-6 flex-wrap gap-2 justify-center md:justify-start">
            <Link
              href="/bible-studies"
              scroll={false}
              className={`px-3 py-1 rounded-full border text-sm ${
                !selectedCategory ? "bg-blue-600 text-white dark:text-slate-50" : "bg-slate-50 dark:bg-slate-950 border border-blue-400/20 text-slate-950 dark:text-slate-100"
              }`}
            >
              All
            </Link>

            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/bible-studies?category=${c.id}`}
                scroll={false}
                className={`px-3 py-1 rounded-full border text-sm border-blue-400/20 ${
                  selectedCategory === String(c.id)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-950"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}


        {/* LIST */}
        {loading ? (
          <p className="pt-10 text-center text-slate-500">Loading…</p>
        ) : visibleItems.length === 0 ? (
          <p className="pt-10 text-center text-slate-500">
            No Bible Studies found.
          </p>
        ) : (
          <>
            <div className="grid pt-6 grid-cols-1 lg:grid-cols-1 gap-8">
           {visibleItems.map((b) => {
                  const daysDiff =
                    Math.max(
                      0,
                      (Date.now() - new Date(b.studyDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                  const showLatest = b.id === latestByDateId && daysDiff <= 7;
           return (
             <motion.div
                key={b.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 26 }}
              >
              <Link
                href={`/bible-studies/${b.id}-${toSlug(b.title)}`}
                className="
                  group relative
                  block rounded-2xl border
                  bg-white dark:bg-slate-950
                  overflow-hidden
                  shadow-xl border-blue-400/20              
                  hover:border-blue-400         
                  hover:shadow-2xl
                  transition-shadow
                  duration-300
                  ease-out
                "
              >
                {b.isPinned && (
                  <span
                    className="
                      absolute top-3 right-3 z-10
                      inline-flex items-center gap-1.5
                      rounded-full
                      bg-amber-500/90 text-white
                      text-xs font-semibold
                      px-3 py-1
                      shadow-md
                      backdrop-blur
                    "
                  >
                  <Pin className="w-4 h-4" /> Pinned
                  </span>
                )} 
                <div className="flex flex-col md:flex-row">
                  {/* 🔥 LATEST STUDY BADGE (IMAGE MODE) */}
                  {showLatest && b.imageUrl && (
                    <span
                      className="
                        absolute
                        top-3 left-3
                        z-10
                        rounded-full
                        bg-sky-600/80 text-white
                        text-xs font-semibold
                        px-3 py-1
                        shadow-md
                        backdrop-blur-lg
                      "
                    >
                      Latest Study
                    </span>
                  )}
                  {/* IMAGE */}
                  {b.imageUrl && (
                    <div className="md:w-72 h-48 md:h-auto overflow-hidden">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="flex-1 p-5 space-y-3">
                    {/* 🔥 LATEST STUDY BADGE */}
                    {showLatest && !b.imageUrl && (
                      <span
                        className="
                          inline-block
                          mb-1
                          w-fit
                          rounded-full
                          bg-sky-600/80 text-white
                          text-xs font-semibold
                          px-3 py-1
                        "
                      >
                        Latest Study
                      </span>
                    )}
                    {/* META */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="w-4 h-4" />
                        {format(new Date(b.studyDate), "MMM d, yyyy")}
                      </span>

                      {b.speaker && (
                        <span className="inline-flex items-center gap-1">
                          <Megaphone className="w-4 h-4" />
                          {b.speaker}
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h2 className="text-lg md:text-2xl font-semibold leading-snug group-hover:text-blue-700 transition">
                      {b.title}
                    </h2>

                    {/* DESCRIPTION */}
                    {b.description && (
                      <p className="text-md text-slate-600 dark:text-slate-300 line-clamp-2">
                        {b.description}
                      </p>
                    )}

                    {/* FOOTER */}
                    <div className="flex items-center justify-between pt-2">
                      {b.category && (
                        <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-slate-800">
                          {b.category.name}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-0.4 text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-600">
                        View Study <ChevronsRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>                          
            </motion.div>
           );
        })}
    </div>

            {/* LOAD MORE */}
            {visibleCount < filtered.length && (
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
                  Load more Bible Studies
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function BibleStudiesPage() {
  return (
    <Suspense fallback={<div className="pt-20 text-center">Loading... <SpinnerIcon /></div>}>
      <BibleStudiesContent />
    </Suspense>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></circle>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0z"></path>
    </svg>
  );
}














// // app/bible-studies/page.tsx

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { format } from "date-fns";
// import CurveWave from "@/components/ui/CurveWave";
// // import { isNewItem } from "@/lib/isNew";
// import { motion, type Variants } from "framer-motion";
// import {
//   ChevronsRight,
//   Megaphone,
//   CalendarClock, Pin,
// } from "lucide-react";

// const fadeUp: Variants = {
//   hidden: { opacity: 0, y: 24 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: [0.16, 1, 0.3, 1], // same easing ginagamit mo sa iba
//     },
//   },
// };

// /* ---------------- HELPERS ---------------- */

// function toSlug(text: string) {
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-");
// }

// /* ---------------- TYPES ---------------- */

// type Category = {
//   id: number;
//   name: string;
// };

// type BibleStudy = {
//   id: number;
//   title: string;
//   speaker?: string | null;
//   description?: string | null;
//   imageUrl?: string | null;
//   studyDate: string;
//   isPinned?: boolean; 
//   category?: Category | null;
// };

// /* ---------------- PAGE ---------------- */

// export default function BibleStudiesPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const [items, setItems] = useState<BibleStudy[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [visibleCount, setVisibleCount] = useState(6);

//   /* ---------------- URL STATE ---------------- */

//   const year = searchParams.get("year") ?? "all";
//   const preacher = searchParams.get("preacher") ?? "all";
//   const selectedCategory = searchParams.get("category");

//   function updateFilter(nextYear: string, nextPreacher: string) {
//     const params = new URLSearchParams(searchParams.toString());
//     nextYear === "all" ? params.delete("year") : params.set("year", nextYear);
//     nextPreacher === "all"
//       ? params.delete("preacher")
//       : params.set("preacher", nextPreacher);

//     router.push(`?${params.toString()}`, { scroll: false });
//     setVisibleCount(6);
//   }

//   /* ---------------- FETCH ---------------- */

//   useEffect(() => {
//     let alive = true;

//     async function load() {
//       try {
//         const qs = new URLSearchParams();
//         if (selectedCategory) qs.set("category", selectedCategory);

//         const [itemsRes, catRes] = await Promise.all([
//           fetch(`/api/bible-studies?${qs.toString()}`, { cache: "no-store" }),
//           fetch(`/api/categories`, { cache: "no-store" }),
//         ]);

//         if (!itemsRes.ok || !catRes.ok) throw new Error();

//         const [itemsData, catData] = await Promise.all([
//           itemsRes.json(),
//           catRes.json(),
//         ]);

//         if (!alive) return;
//         setItems(itemsData ?? []);
//         setCategories(catData ?? []);
//       } catch {
//         if (!alive) return;
//         setItems([]);
//         setCategories([]);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       alive = false;
//     };
//   }, [selectedCategory]);

//   /* ---------------- FILTER OPTIONS ---------------- */

//   const years = useMemo(() => {
//     const set = new Set<string>();
//     items.forEach((b) =>
//       set.add(new Date(b.studyDate).getFullYear().toString())
//     );
//     return Array.from(set).sort((a, b) => Number(b) - Number(a));
//   }, [items]);

//   const preachers = useMemo(() => {
//     const set = new Set<string>();
//     items.forEach((b) => b.speaker && set.add(b.speaker));
//     return Array.from(set).sort();
//   }, [items]);

//   /* ---------------- FILTERED LIST ---------------- */

// const filtered = useMemo(() => {
//   return items
//     .filter((b) => {
//       const matchYear =
//         year === "all" ||
//         new Date(b.studyDate).getFullYear().toString() === year;
//       const matchPreacher =
//         preacher === "all" || b.speaker === preacher;
//       return matchYear && matchPreacher;
//     })
//     .sort(
//       (a, b) =>
//         new Date(b.studyDate).getTime() -
//         new Date(a.studyDate).getTime()
//     );
// }, [items, year, preacher]);

//   const pinnedStudies = filtered.filter((b) => b.isPinned);
//   const normalStudies = filtered.filter((b) => !b.isPinned);

//   // ✅ show pinned first, then normal
//   const combined = [...pinnedStudies, ...normalStudies];

//   // ✅ apply load more sa combined list
//   const visibleItems = combined.slice(0, visibleCount);

//   const latestByDateId = useMemo(() => {
//     if (filtered.length === 0) return null;

//     return [...filtered]
//       .sort(
//         (a, b) =>
//           new Date(b.studyDate).getTime() -
//           new Date(a.studyDate).getTime()
//       )[0].id;
//   }, [filtered]);

//   /* ---------------- RENDER ---------------- */

//   return (
//     <div className="space-y-16 bg-white dark:bg-slate-950">
//       {/* HERO */}
//       <motion.section
//             variants={fadeUp}
//             initial="hidden"
//             animate="visible"
//             className="relative h-[32vh] sm:h-[45vh] md:h-[40vh] min-h-[300px] sm:min-h-[340px] overflow-hidden"
//           >

//         <div
//           className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//           style={{ backgroundImage: "url('/church-contact.jpg')" }}
//         />
//         <div className="absolute inset-0 bg-black/60" />
//         <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-4 sm:pt-16">
//           <div className="max-w-xl sm:max-w-2xl mx-auto">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//               Bible Studies
//             </h1>
//             <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg">
//               Watch, listen, and download Bible Study sessions.
//             </p>
//           </div>
//         </div>
//         <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//           <CurveWave />
//         </div>
//       </motion.section>

//       <div className="max-w-7xl mx-auto px-4 pb-28 space-y-6">
//         {/* INTRO */}
//         <motion.section
//               variants={fadeUp}
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               className="max-w-6xl mx-auto text-center space-y-6"
//             >
//             <h2 className="text-2xl md:text-3xl font-bold">
//               Rooted in the Word of God
//            </h2>
//               <p className="text-lg text-slate-700 dark:text-slate-300">
//                 Our Bible studies are centered on the Word of God, seeking understanding,
//                 growth, and faithful living through Scripture.
//               </p>
//             <blockquote className="italic text-lg text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
//                  “All scripture is given by inspiration of God, and is profitable for doctrine,
//                   for reproof, for correction, for instruction in righteousness:
//                 That the man of God may be perfect, throughly furnished unto all good works.”
//                   <span className="block not-italic mt-2 text-md font-medium text-slate-800 dark:text-slate-200">
//                     — 2 Timothy 3:16–17 (KJV) 
//                   </span>
//             </blockquote>
//         </motion.section>

//         {/* HEADER */}
//           <motion.header
//               variants={fadeUp}
//               initial="hidden"
//               whileInView="visible"
//               viewport={{ once: true }}
//               className="space-y-2 text-center pt-12 md:text-left"
//             >
//            <h2 className="text-3xl font-bold">Bible Study Sessions</h2>
//             <p className="text-slate-600 dark:text-slate-400">
//              Explore Bible Study lessons taught from Scripture, with downloadable materials.
//             </p>
//         </motion.header>

//         {/* YEAR + PREACHER (AUTO) */}
//         <motion.div
//           variants={fadeUp}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           className="flex flex-wrap gap-3 items-center rounded-2xl p-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border"
//         >
//           <select
//             value={year}
//             onChange={(e) => updateFilter(e.target.value, preacher)}
//             className="rounded-lg border px-3 py-2 text-sm"
//           >
//             <option value="all">All Years</option>
//             {years.map((y) => (
//               <option key={y} value={y}>{y}</option>
//             ))}
//           </select>

//           <select
//             value={preacher}
//             onChange={(e) => updateFilter(year, e.target.value)}
//             className="rounded-lg border px-3 py-2 text-sm"
//           >
//             <option value="all">All Preachers</option>
//             {preachers.map((p) => (
//               <option key={p} value={p}>{p}</option>
//             ))}
//           </select>

//           <span className="ml-auto text-xs text-slate-500">
//             {filtered.length} results
//           </span>
//         </motion.div>

//         {/* CATEGORY */}
//         {categories.length > 0 && (
//           <div className="flex pt-6 flex-wrap gap-2 justify-center md:justify-start">
//             <Link
//               href="/bible-studies"
//               scroll={false}
//               className={`px-3 py-1 rounded-full border text-sm ${
//                 !selectedCategory ? "bg-blue-600 text-white" : "bg-white"
//               }`}
//             >
//               All
//             </Link>

//             {categories.map((c) => (
//               <Link
//                 key={c.id}
//                 href={`/bible-studies?category=${c.id}`}
//                 scroll={false}
//                 className={`px-3 py-1 rounded-full border text-sm ${
//                   selectedCategory === String(c.id)
//                     ? "bg-blue-600 text-white"
//                     : "bg-slate-100 dark:bg-slate-950"
//                 }`}
//               >
//                 {c.name}
//               </Link>
//             ))}
//           </div>
//         )}

//         {/* LIST */}
//         {loading ? (
//           <p className="pt-10 text-center text-slate-500">Loading…</p>
//         ) : visibleItems.length === 0 ? (
//           <p className="pt-10 text-center text-slate-500">
//             No Bible Studies found.
//           </p>
//         ) : (
//           <>
//             <div className="grid pt-6 grid-cols-1 lg:grid-cols-1 gap-6">
//            {visibleItems.map((b) => {
//                   const daysDiff =
//                     Math.max(
//                       0,
//                       (Date.now() - new Date(b.studyDate).getTime()) /
//                         (1000 * 60 * 60 * 24)
//                     );

//                   const showLatest = b.id === latestByDateId && daysDiff <= 7;
//            return (
//              <motion.div
//                 key={b.id}
//                 variants={fadeUp}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 whileHover={{ scale: 1.02, y: -4 }}
//                 transition={{ type: "spring", stiffness: 260, damping: 20 }}
//               >
//               <Link
//                 href={`/bible-studies/${b.id}-${toSlug(b.title)}`}
//                 className="
//                   group relative
//                   block rounded-2xl border
//                   bg-white dark:bg-slate-900
//                   overflow-hidden
//                   transition
//                   shadow-xl
//                   hover:shadow-2xl
//                   hover:border-blue-400
//                 "
//               >
//                 {b.isPinned && (
//                   <span
//                     className="
//                       absolute top-3 right-3 z-10
//                       inline-flex items-center gap-1.5
//                       rounded-full
//                       bg-amber-500/90 text-white
//                       text-xs font-semibold
//                       px-3 py-1
//                       shadow-md
//                       backdrop-blur
//                     "
//                   >
//                   <Pin className="w-4 h-4" /> Pinned
//                   </span>
//                 )} 
//                 <div className="flex flex-col md:flex-row">
//                   {/* 🔥 LATEST STUDY BADGE (IMAGE MODE) */}
//                   {showLatest && b.imageUrl && (
//                     <span
//                       className="
//                         absolute
//                         top-3 left-3
//                         z-10
//                         rounded-full
//                         bg-sky-600/80 text-white
//                         text-xs font-semibold
//                         px-3 py-1
//                         shadow-md
//                         backdrop-blur-lg
//                       "
//                     >
//                       Latest Study
//                     </span>
//                   )}
//                   {/* IMAGE */}
//                   {b.imageUrl && (
//                     <div className="md:w-72 h-48 md:h-auto overflow-hidden">
//                       <img
//                         src={b.imageUrl}
//                         alt={b.title}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                       />
//                     </div>
//                   )}

//                   {/* CONTENT */}
//                   <div className="flex-1 p-5 space-y-3">
//                     {/* 🔥 LATEST STUDY BADGE */}
//                     {showLatest && !b.imageUrl && (
//                       <span
//                         className="
//                           inline-block
//                           mb-1
//                           w-fit
//                           rounded-full
//                           bg-sky-600/80 text-white
//                           text-xs font-semibold
//                           px-3 py-1
//                         "
//                       >
//                         Latest Study
//                       </span>
//                     )}
//                     {/* META */}
//                     <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
//                       <span className="inline-flex items-center gap-1">
//                         <CalendarClock className="w-4 h-4" />
//                         {format(new Date(b.studyDate), "MMM d, yyyy")}
//                       </span>

//                       {b.speaker && (
//                         <span className="inline-flex items-center gap-1">
//                           <Megaphone className="w-4 h-4" />
//                           {b.speaker}
//                         </span>
//                       )}
//                     </div>

//                     {/* TITLE */}
//                     <h2 className="text-lg md:text-2xl font-semibold leading-snug group-hover:text-blue-700 transition">
//                       {b.title}
//                     </h2>

//                     {/* DESCRIPTION */}
//                     {b.description && (
//                       <p className="text-md text-slate-600 dark:text-slate-300 line-clamp-2">
//                         {b.description}
//                       </p>
//                     )}

//                     {/* FOOTER */}
//                     <div className="flex items-center justify-between pt-2">
//                       {b.category && (
//                         <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-slate-800">
//                           {b.category.name}
//                         </span>
//                       )}

//                       <span className="inline-flex items-center gap-0.4 text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-600">
//                         View Study <ChevronsRight className="w-4 h-4" />
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </Link>                          
//             </motion.div>
//            );
//         })}
//     </div>

//             {/* LOAD MORE */}
//             {visibleCount < filtered.length && (
//               <motion.div
//                     variants={fadeUp}
//                     initial="hidden"
//                     whileInView="visible"
//                     viewport={{ once: true }}
//                     className="text-center pt-12"
//                   >
//                 <button
//                   onClick={() => setVisibleCount((c) => c + 6)}
//                   className="rounded-full px-6 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
//                 >
//                   Load more Bible Studies
//                 </button>
//               </motion.div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }






// import Link from "next/link";
// import { format } from "date-fns";
// import CurveWave from "@/components/ui/CurveWave";

// /* ---------------- HELPERS ---------------- */

// function toSlug(text: string) {
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-");
// }

// /* ---------------- TYPES ---------------- */

// type Category = {
//   id: number;
//   name: string;
// };

// type BibleStudy = {
//   id: number;
//   title: string;
//   speaker?: string | null;
//   description?: string | null;
//   imageUrl?: string | null;
//   studyDate: string;
//   category?: Category | null;
// };

// /* ---------------- DATA FETCHERS ---------------- */

// async function getBibleStudies(params: {
//   category?: string;
//   year?: string;
//   preacher?: string;
// }): Promise<BibleStudy[]> {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const qs = new URLSearchParams();

//   if (params.category) qs.set("category", params.category);
//   if (params.year) qs.set("year", params.year);
//   if (params.preacher) qs.set("preacher", params.preacher);

//   const res = await fetch(`${base}/api/bible-studies?${qs.toString()}`, {
//     cache: "no-store",
//   });

//   if (!res.ok) return [];
//   return res.json();
// }

// async function getCategories(): Promise<Category[]> {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const res = await fetch(`${base}/api/categories`, { cache: "no-store" });
//   if (!res.ok) return [];
//   return res.json();
// }

// /* ---------------- PAGE ---------------- */

// export default async function BibleStudiesPage({
//   searchParams,
// }: {
//   searchParams: Promise<{
//     category?: string;
//     year?: string;
//     preacher?: string;
//   }>;
// }) {
//   const sp = await searchParams;

//   const [items, categories] = await Promise.all([
//     getBibleStudies(sp),
//     getCategories(),
//   ]);

//   /* ---------- FILTER OPTIONS (derived) ---------- */

//   const years = Array.from(
//     new Set(items.map((b) => new Date(b.studyDate).getFullYear().toString()))
//   ).sort((a, b) => Number(b) - Number(a));

//   const preachers = Array.from(
//     new Set(items.map((b) => b.speaker).filter(Boolean))
//   ).sort();

//   return (
//     <div className="space-y-16 bg-white dark:bg-slate-950">
//       {/* HEADER */}
//       <section className="relative h-[32vh] sm:h-[45vh] min-h-[300px] -mt-16 overflow-hidden">
//         <div
//           className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//           style={{ backgroundImage: "url('/church-contact.jpg')" }}
//         />
//         <div className="absolute inset-0 bg-black/60" />
//         <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-4 sm:pt-16">
//           <div className="max-w-xl sm:max-w-2xl mx-auto">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//               Bible Studies
//             </h1>
//             <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg">
//               Watch, listen, and download Bible Study sessions.
//             </p>
//           </div>
//         </div>
//         <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//           <CurveWave />
//         </div>
//       </section>

//       <div className="max-w-7xl mx-auto px-4 pb-28 space-y-6">
  
//         <section className="max-w-6xl mx-auto text-center space-y-6">
//            <h2 className="text-2xl md:text-3xl font-bold">
//               Rooted in the Word of God
//            </h2>
//               <p className="text-lg text-slate-700 dark:text-slate-300">
//                   Our Bible studies are centered on the Word of God, seeking understanding,
//                   growth, and faithful living through Scripture.
//               </p>
//               <blockquote className="italic text-lg text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
//                 “All scripture is given by inspiration of God, and is profitable for doctrine,
//                  for reproof, for correction, for instruction in righteousness:
//                 That the man of God may be perfect, throughly furnished unto all good works.”
//                  <span className="block not-italic mt-2 text-md font-medium text-slate-800 dark:text-slate-200">
//                    2 Timothy 3:16–17 (KJV) 
//                  </span>
//                 </blockquote>
//           </section>

//         {/* PAGE HEADER */}
//         <header className="space-y-2 text-center md:text-left">
//           <h2 className="text-3xl font-bold">Bible Study Sessions</h2>
//            <p className="text-slate-600 dark:text-slate-400">
//             Explore Bible Study lessons taught from Scripture, with outlines, videos, and downloadable materials.
//            </p>
//         </header>

//         {/* 🔽 YEAR + PREACHER FILTER (NEW) */}
//         <form className="flex flex-wrap gap-3 items-center rounded-2xl p-4
//                          bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border">
//           {sp.category && (
//             <input type="hidden" name="category" value={sp.category} />
//           )}

//           <select
//             name="year"
//             defaultValue={sp.year ?? ""}
//             className="rounded-lg border px-3 py-2 text-sm"
//           >
//             <option value="">All Years</option>
//             {years.map((y) => (
//               <option key={y} value={y}>{y}</option>
//             ))}
//           </select>

//           <select
//             name="preacher"
//             defaultValue={sp.preacher ?? ""}
//             className="rounded-lg border px-3 py-2 text-sm"
//           >
//             <option value="">All Preachers</option>
//             {preachers.map((p) => (
//               <option key={p!} value={p!}>{p}</option>
//             ))}
//           </select>

//           <button
//             type="submit"
//             className="ml-auto rounded-lg bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700"
//           >
//             Apply
//           </button>
//         </form>

//         {/* ✅ CATEGORY FILTER (UNCHANGED) */}
//         {categories.length > 0 && (
//           <div className="flex pt-6 flex-wrap gap-2 justify-center md:justify-start">
//             <Link
//               href="/bible-studies"
//               scroll={false}
//               className={`px-3 py-1 rounded-full border text-sm transition ${
//                 !sp.category
//                   ? "bg-blue-600 text-white"
//                   : "bg-white hover:bg-slate-100"
//               }`}
//             >
//               All
//             </Link>

//             {categories.map((c) => (
//               <Link
//                 key={c.id}
//                 href={`/bible-studies?category=${c.id}`}
//                 scroll={false}
//                 className={`px-3 py-1 rounded-full border text-sm transition ${
//                   sp.category === String(c.id)
//                     ? "bg-blue-600 text-white"
//                     : "bg-slate-100 hover:bg-slate-200"
//                 }`}
//               >
//                 {c.name}
//               </Link>
//             ))}
//           </div>
//         )}

//         {/* LIST */}
//         {items.length === 0 ? (
//           <p className="text-md text-slate-800 dark:text-slate-100">
//             No Bible Studies found.
//           </p>
//         ) : (
//           <div className="grid gap-6">
//               {items.map((b) => (
//                 <Link
//                   key={b.id}
//                   href={`/bible-studies/${b.id}-${toSlug(b.title)}`}
//                   className="block rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400
//                             p-4 hover:shadow-xl transition"
//                 >
//                   <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    
//                     {/* IMAGE (IBINALIK) */}
//                     {b.imageUrl && (
//                       <img
//                         src={b.imageUrl}
//                         alt={b.title}
//                         className="w-full sm:w-72 sm:max-w-xs h-44 sm:h-40
//                                   object-cover rounded-lg border"
//                       />
//                     )}

//                     {/* CONTENT */}
//                     <div className="space-y-2">
//                       <h2 className="font-semibold text-lg sm:text-xl md:text-2xl">
//                         {b.title}
//                       </h2>

//                       <p className="text-sm sm:text-md text-slate-800 dark:text-slate-200">
//                         {format(new Date(b.studyDate), "MMM d, yyyy • h:mm a")}
//                         {b.speaker && ` • ${b.speaker}`}
//                       </p>

//                       {b.category && (
//                         <span className="inline-block text-sm bg-blue-100 dark:bg-slate-800
//                                         px-3 py-0.5 rounded-lg">
//                           {b.category.name}
//                         </span>
//                       )}

//                       {b.description && (
//                         <p className="text-sm sm:text-lg text-slate-700 dark:text-slate-300 line-clamp-2">
//                           {b.description}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }










// // app/bible-studies/page.tsx
// import Link from "next/link";
// import { format } from "date-fns";
// import CurveWave from "@/components/ui/CurveWave";
// // import {
// //          BookOpen,
// //        } from "lucide-react";


// function toSlug(text: string) {
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-");
// }


// /* ---------------- TYPES ---------------- */

// type Category = {
//   id: number;
//   name: string;
// };

// type BibleStudy = {
//   id: number;
//   title: string;
//   speaker?: string | null;
//   description?: string | null;
//   imageUrl?: string | null;
//   studyDate: string;
//   category?: Category | null;
// };

// /* ---------------- DATA FETCHERS ---------------- */

// async function getBibleStudies(category?: string): Promise<BibleStudy[]> {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const qs = category ? `?category=${category}` : "";

//   const res = await fetch(`${base}/api/bible-studies${qs}`, {
//     cache: "no-store",
//   });

//   if (!res.ok) return [];
//   return res.json();
// }

// async function getCategories(): Promise<Category[]> {
//   const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
//   const res = await fetch(`${base}/api/categories`, {
//     cache: "no-store",
//   });

//   if (!res.ok) return [];
//   return res.json();
// }

// /* ---------------- PAGE ---------------- */

// export default async function BibleStudiesPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ category?: string }>;
// }) {
//   // ✅ REQUIRED IN NEXT 15 / 16
//   const sp = await searchParams;
//   const selectedCategory = sp.category;

//   const [items, categories] = await Promise.all([
//     getBibleStudies(selectedCategory),
//     getCategories(),
//   ]);

//   return (
//           <div className="space-y-16 bg-white dark:bg-slate-950 ">
//                   {/* HEADER */}
//               <section className="relative h-[32vh] sm:h-[45vh] md:h-[40vh] min-h-[300px] sm:min-h-[340px] -mt-16 overflow-hidden">
//                 {/* Background Image */}
//                 <div
//                   className="absolute inset-0 bg-cover bg-center scale-110 blur-md"
//                   style={{
//                      backgroundImage: "url('/church-contact.jpg')",
//                    }}
//                 />
//              <div className="absolute inset-0 bg-black/60" />
//                <div className="relative z-10 flex items-center justify-center h-full text-center px-4 pt-4 sm:pt-16">
//                   <div className="max-w-xl sm:max-w-2xl mx-auto">
//                       <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
//                         Bible Studies
//                       </h1>
//                       <p className="pt-2 sm:pt-4 text-slate-200 text-base sm:text-lg leading-relaxed">
//                          Watch, listen, and download Bible Study sessions.
//                       </p>
//                     </div>
//                   </div>
//                 <div className="absolute bottom-0 left-0 w-full pointer-events-none">
//                    <CurveWave />
//                    </div>   
//                 </section>

//           <div className="max-w-7xl mx-auto px-4 pb-28 space-y-6">

//             <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 py-4 text-center space-y-6">
//             <h2 className="text-2xl md:text-3xl font-bold">
//               Rooted in the Word of God
//             </h2>
//               <p className="text-lg text-slate-700 dark:text-slate-300">
//                 Our Bible studies are centered on the Word of God, seeking understanding,
//                 growth, and faithful living through Scripture.
//               </p>

//               <blockquote className="italic text-lg text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
//                 “All scripture is given by inspiration of God, and is profitable for doctrine,
//                 for reproof, for correction, for instruction in righteousness:
//                 That the man of God may be perfect, throughly furnished unto all good works.”
//                 <span className="block not-italic mt-2 text-md font-medium text-slate-800 dark:text-slate-200">
//                   2 Timothy 3:16–17 (KJV) 
//                 </span>
//               </blockquote>
//             </section>

//             {/* HEADER */}
//         <header className="space-y-2 text-center md:text-left">
//           <h2 className="text-3xl font-bold">Bible Study Sessions</h2>
//           <p className="text-slate-600 dark:text-slate-400">
//             Explore Bible Study lessons taught from Scripture, with outlines, videos, and downloadable materials.
//           </p>
//         </header>

//        {/* ✅ CATEGORY FILTER */}

//         {categories.length > 0 && (
//           <div className="flex pt-6 flex-wrap gap-2 justify-center md:justify-start">
//             <Link
//               href="/bible-studies"
//               scroll={false}
//               className={`px-3 py-1 rounded-full border text-sm transition ${
//                 !selectedCategory
//                   ? "bg-blue-600 text-white"
//                   : "bg-white dark:text-slate-800 hover:bg-slate-100"
//               }`}
//             >
//               All
//             </Link>

//           {categories.map((c) => (
//             <Link
//               key={c.id}
//               href={`/bible-studies?category=${c.id}`}
//               scroll={false}
//               className={`px-3 py-1 rounded-full border text-sm transition ${
//                 selectedCategory === String(c.id)
//                   ? "bg-blue-600 dark:bg-blue-800 text-white dark:text-slate-100"
//                   : "bg-slate-100 dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-100"
//               }`}
//             >
//               {c.name}
//             </Link>
//           ))}
//         </div>
//       )}

//       {/* LIST */}
//       {items.length === 0 ? (
//         <p className="text-md text-slate-800 dark:text-slate-100">
//           No Bible Studies found.
//         </p>
//       ) : (
//         <div className="grid gap-6 md:grid-cols-1">
//           {items.map((b) => (
//             <Link
//               key={b.id}
//              href={`/bible-studies/${b.id}-${toSlug(b.title)}`}
//               className="block rounded-lg border bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 p-4 hover:shadow-xl dark:hover:shadow-2xl transition"
//             >
//               <div className="flex flex-col pb-4 sm:flex-row gap-4 sm:gap-8">
//                 {b.imageUrl && (
//                     <img
//                         src={b.imageUrl}
//                         alt={b.title}
//                         className="w-full sm:w-80 sm:max-w-xs h-48 sm:h-40 object-cover rounded-lg border"
//                       />
//                 )}

//                 <div className="space-y-2">
//                   <h2 className="font-semibold text-lg sm:text-xl md:text-2xl">{b.title}</h2>

//                   <p className="text-sm sm:text-md text-slate-800 dark:text-slate-200">
//                     {format(new Date(b.studyDate), "MMM d, yyyy • h:mm a")}
//                     {b.speaker ? ` • ${b.speaker}` : ""}
//                   </p>

//                   {b.category && (
//                     <span className="inline-block text-sm sm:text-md bg-blue-100 dark:bg-slate-800 px-3 py-0.5 rounded-lg">
//                       {b.category.name}
//                     </span>
//                   )}

//                   {b.description && (
//                     <p className="text-sm sm:text-lg text-slate-800 dark:text-slate-200 line-clamp-2 mt-1">
//                       {b.description}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   </div>
//   );
// }
