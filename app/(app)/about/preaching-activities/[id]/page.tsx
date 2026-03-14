"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import CollapsibleMarkdownSections from "@/components/CollapsibleMarkdownSections";
import MarkdownBlock from "@/components/MarkdownBlock";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronsLeft,
  ChevronRight,
  ChevronLeft,
  BookMarked,
  CalendarDays,
  MapPin,
  User,
  Tag,
  Images,
  X,
} from "lucide-react";

interface Activity {
  title: string;
  type: string;
  gallery: string[];
  description?: string;
  outline?: string;
  content?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  preacher?: string;
  coverImageUrl?: string;
}

/* ================= FETCH ================= */
async function getActivity(id: string): Promise<Activity | null> {
  try {
    const res = await fetch(`/api/preaching-activities/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as Activity;

    return {
      ...data,
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
    };
  } catch (err) {
    console.error("Failed to fetch activity:", err);
    return null;
  }
}

/* ================= LABEL ================= */
function typeLabel(type: string) {
  const map: Record<string, string> = {
    gospel_meeting: "Gospel Meeting",
    gospel_preaching: "Gospel Preaching",
    midweek_service: "Midweek Service",
    sunday_service: "Sunday Service",
    visitation: "Visitation",
    mission_trip: "Mission Trip",
    youth_service: "Youth Service",
    special_event: "Special Event",
    preachers_bible_class: "Preachers Bible Class",
  };

  return map[type] ?? type;
}

function formatDateRange(startDate: string, endDate?: string) {
  const start = new Date(startDate);

  if (!endDate) {
    return format(start, "MMM d, yyyy • h:mm a");
  }

  const end = new Date(endDate);

  return `${format(start, "MMM d, yyyy • h:mm a")} — ${format(
    end,
    "MMM d, yyyy • h:mm a"
  )}`;
}

/* ================= PAGE ================= */
export default function PreachingActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const { id: raw } = use(params);
  const id = raw.split("-")[0];

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  const [paused, setPaused] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [direction, setDirection] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);

  const heroImage = useMemo(() => {
    return (
      activity?.coverImageUrl ||
      activity?.gallery?.[0] ||
      "/church-contact.jpg"
    );
  }, [activity]);

  const nextImage = () => {
    if (!activity?.gallery?.length) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % activity.gallery.length);
  };

  const prevImage = () => {
    if (!activity?.gallery?.length) return;
    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + activity.gallery.length) % activity.gallery.length
    );
  };

  const nextLightbox = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index + 1) % lightbox.images.length,
    });
  };

  const prevLightbox = () => {
    if (!lightbox) return;
    setLightbox({
      ...lightbox,
      index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length,
    });
  };

  useEffect(() => {
    if (!activity?.gallery?.length || paused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % activity.gallery.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [activity, paused]);

  /* ================= LOAD ================= */
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      const data = await getActivity(id);

      if (!alive) return;

      setActivity(data);
      setLoading(false);
    };

    load();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activity]);

  useEffect(() => {
    if (!lightbox) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "Escape") setLightbox(null);
    };

    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-500" />
          <span className="text-sm">Loading activity…</span>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-24">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Activity not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            The activity you’re looking for doesn’t exist or was removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900 transition"
          >
            <ChevronsLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={activity.title}
            fill
            priority
            sizes="100vw"
            className="object-cover scale-110"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />

        <div className="relative z-10 flex items-center justify-center min-h-[420px] sm:min-h-[460px] px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium text-white backdrop-blur">
                {typeLabel(activity.type)}
              </span>
            </div>

            <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {activity.title}
            </h1>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center justify-center pb-6 w-full gap-2">
          <motion.button
            onClick={() => router.back()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur px-4 py-2 text-sm font-medium text-blue-100 hover:text-white hover:bg-white/15 transition"
          >
            <ChevronsLeft className="w-4 h-4" />
            All Activities
          </motion.button>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 py-12 pb-24 space-y-10 sm:space-y-12"
      >
        {/* BREADCRUMBS */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <BookMarked className="w-4 h-4" />

          <Link
            href="/about/preaching-activities"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Preaching Activities
          </Link>

          <ChevronRight className="w-4 h-4" />

          <span className="truncate max-w-[220px] text-slate-700 dark:text-slate-200 font-medium">
            {activity.title}
          </span>
        </nav>

        {/* ================= SPLIT HEADER CARD ================= */}
        <Card className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950">
          <div className="grid md:grid-cols-2">
            {/* LEFT: IMAGE */}
            <div className="relative group h-[260px] sm:h-[320px] md:h-full min-h-[260px] bg-slate-100 dark:bg-slate-900">
              <Image
                src={heroImage}
                alt={activity.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent md:hidden" />
            </div>

            {/* RIGHT: CONTENT */}
            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-6">
              {/* TITLE */}
              <div className="space-y-4">
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl leading-tight text-slate-900 dark:text-white">
                  {activity.title}
                </CardTitle>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <CalendarDays className="w-4 h-4 mt-1 shrink-0" />
                  <span className="text-sm sm:text-base leading-relaxed">
                    {formatDateRange(activity.startDate, activity.endDate)}
                  </span>
                </div>
              </div>

              {/* META GRID */}
              <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Tag className="w-4 h-4 text-slate-500 shrink-0" />
                  <Badge
                    variant="secondary"
                    className="text-sm rounded-full px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-0"
                  >
                    {typeLabel(activity.type)}
                  </Badge>
                </div>

                {activity.location && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>{activity.location}</span>
                  </div>
                )}

                {activity.preacher && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Bro. {activity.preacher}</span>
                  </div>
                )}
              </div>

              {activity.description && (
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4">
                  <p className="text-sm sm:text-base leading-7 text-slate-600 dark:text-slate-300 line-clamp-4">
                    {activity.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* ================= GALLERY ================= */}
        {activity.gallery.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Images className="w-5 h-5 text-slate-500" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Photos
              </h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                ({activity.gallery.length})
              </span>
            </div>

            <div
              className="relative group overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg w-full h-[320px] sm:h-[420px] bg-slate-100 dark:bg-slate-900 cursor-pointer"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onClick={() =>
                setLightbox({
                  images: activity.gallery,
                  index: activeIndex,
                })
              }
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={`slide-${activeIndex}`}
                  className="absolute inset-0"
                  initial={{ x: `${direction * 100}%` }}
                  animate={{ x: "0%" }}
                  exit={{ x: `${direction * -100}%` }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                >
                  <Image
                    src={activity.gallery[activeIndex] || "/church-contact.jpg"}
                    alt={`${activity.title} ${activeIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

              {activity.gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/55 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/55 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur">
                {activeIndex + 1} / {activity.gallery.length}
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {activity.gallery.map((_: string, i: number) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  onClick={() => {
                    setDirection(i > activeIndex ? 1 : -1);
                    setActiveIndex(i);
                  }}
                  className={`transition-all rounded-full ${
                    activeIndex === i
                      ? "w-8 h-2.5 bg-blue-600"
                      : "w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ================= LIGHTBOX ================= */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
              onClick={() => setLightbox(null)}
            >
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.96 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-6xl rounded-2xl overflow-hidden"
              >
                <div className="relative w-full h-[75vh] sm:h-[85vh]">
                <Image
                    src={lightbox.images[lightbox.index]}
                    alt={`Preview ${lightbox.index + 1}`}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain"
                  />
                </div>

                <button
                  onClick={() => setLightbox(null)}
                  className="absolute top-4 right-4 bg-black/60 text-white w-11 h-11 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>

                {lightbox.images.length > 1 && (
                  <>
                    <button
                      onClick={prevLightbox}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-11 h-11 rounded-full flex items-center justify-center"
                    >
                      <ChevronLeft />
                    </button>

                    <button
                      onClick={nextLightbox}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-11 h-11 rounded-full flex items-center justify-center"
                    >
                      <ChevronRight />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-white text-sm">
                  {lightbox.index + 1} / {lightbox.images.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= DESCRIPTION ================= */}
        {activity.description && (
          <section className="space-y-3">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Description
            </h3>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm">
              <p className="text-slate-600 text-base sm:text-lg leading-8 dark:text-slate-300 whitespace-pre-line">
                {activity.description}
              </p>
            </div>
          </section>
        )}

        {/* ================= OUTLINE ================= */}
        {activity.outline && (
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
            <button
              onClick={() => setShowOutline(!showOutline)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <span className="text-xl font-semibold text-slate-900 dark:text-white">
                Outline
              </span>
              <ChevronRight
                className={`w-5 h-5 text-slate-500 transition-transform ${
                  showOutline ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {showOutline && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 py-5 text-base sm:text-lg">
                    <CollapsibleMarkdownSections markdown={activity.outline} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}

        {/* ================= REPORT ================= */}
        {activity.content && (
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
            <button
              onClick={() => setShowReport(!showReport)}
              className="w-full flex items-center justify-between px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <span className="text-xl font-semibold text-slate-900 dark:text-white">
                Report
              </span>
              <ChevronRight
                className={`w-5 h-5 text-slate-500 transition-transform ${
                  showReport ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {showReport && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 sm:px-6 py-5 text-base sm:text-lg">
                    <MarkdownBlock content={activity.content} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </motion.section>
    </div>
  );
}







// "use client";


// import { use, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { format } from "date-fns";
// import Link from "next/link";
// import Image from "next/image";
// import CollapsibleMarkdownSections from "@/components/CollapsibleMarkdownSections";
// import MarkdownBlock from "@/components/MarkdownBlock";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//           ChevronsLeft,
//           ChevronRight,
//           ChevronLeft,
//           BookMarked,
//           CalendarDays, MapPin, User, Tag 
//        } from "lucide-react";

//  interface Activity {
//   title: string;
//   type: string;
//   gallery: string[];
//   description?: string;
//   outline?: string;
//   content?: string;
//   startDate: string;
//   endDate?: string;
//   location?: string;
//   preacher?: string;
//   coverImageUrl?: string;
// }
      
// /* ================= FETCH ================= */
// async function getActivity(id: string): Promise<Activity | null> {
//   try {
//     const res = await fetch(`/api/preaching-activities/${id}`, {
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = (await res.json()) as Activity;

//     return {
//       ...data,
//       gallery: data.gallery ?? [],
//     };
//   } catch (err) {
//     console.error("Failed to fetch activity:", err);
//     return null;
//   }
// }

// /* ================= LABEL ================= */
// function typeLabel(type: string) {
//   const map: Record<string, string> = {
//     gospel_meeting: "Gospel Meeting",
//     gospel_preaching: "Gospel Preaching",
//     midweek_service: "Midweek Service",
//     sunday_service: "Sunday Service",
//     visitation: "Visitation",
//     mission_trip: "Mission Trip",
//     youth_service: "Youth Service",
//     special_event: "Special Event",
//     preachers_bible_class: "Preachers Bible Class",
    
//   };
//   return map[type] ?? type;
// }

// /* ================= PAGE ================= */
// export default function PreachingActivityDetailPage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const router = useRouter();

//   /* 🔗 SLUG FIX: extract numeric ID */
//   const { id: raw } = use(params);
//   const id = raw.split("-")[0]; // "1-title-here" → "1"

//   const [activity, setActivity] = useState<Activity | null>(null);

//   // const [activity, setActivity] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   /* gallery */
//   const [paused, setPaused] = useState(false);
//   const [showOutline, setShowOutline] = useState(false);
//   const [showReport, setShowReport] = useState(false);

//   const [direction, setDirection] = useState(1);
//   const [activeIndex, setActiveIndex] = useState(0);

//   const [lightbox, setLightbox] = useState<{
//     images: string[];
//     index: number;
//   } | null>(null);


//   const nextImage = () => {
//   if (!activity?.gallery?.length) return;
//   setDirection(1);
//   setActiveIndex((prev) =>
//     (prev + 1) % activity.gallery.length
//   );
// };

// const prevImage = () => {
//   if (!activity?.gallery?.length) return;
//   setDirection(-1);
//   setActiveIndex((prev) =>
//     (prev - 1 + activity.gallery.length) %
//     activity.gallery.length
//   );
// };

// const nextLightbox = () => {
//   if (!lightbox) return;
//   setLightbox({
//     ...lightbox,
//     index: (lightbox.index + 1) % lightbox.images.length,
//   });
// };

// const prevLightbox = () => {
//   if (!lightbox) return;
//   setLightbox({
//     ...lightbox,
//     index:
//       (lightbox.index - 1 + lightbox.images.length) %
//       lightbox.images.length,
//   });
// };


// useEffect(() => {
//   if (!activity?.gallery?.length) return;
//   if (paused) return;

//   const timer = setInterval(() => {
//     setDirection(1);
//     setActiveIndex((prev) =>
//       (prev + 1) % activity.gallery.length
//     );
//   }, 4000);

//   return () => clearInterval(timer);
// }, [activity, paused]);


//   /* ================= LOAD ================= */
//   useEffect(() => {
//     const load = async () => {
//       const data = await getActivity(id);
//       setActivity(data);
//       setLoading(false);
//     };
//     load();
//   }, [id]);

//   useEffect(() => {
//   setActiveIndex(0);
// }, [activity]);


//   useEffect(() => {
//   if (!lightbox) return;

//   const handler = (e: KeyboardEvent) => {
//     if (e.key === "ArrowRight") nextLightbox();
//     if (e.key === "ArrowLeft") prevLightbox();
//     if (e.key === "Escape") setLightbox(null);
//   };

//   window.addEventListener("keydown", handler);
//   return () => window.removeEventListener("keydown", handler);
// }, [lightbox]);


//   /* ================= STATES ================= */
// if (loading) {
//   return (
//     <div className="min-h-screen flex items-center justify-center pt-20">
//       <div className="flex flex-col items-center gap-3 text-slate-500">
//         <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
//         <span className="text-sm">Loading activity…</span>
//       </div>
//     </div>
//   );
// }


// if (!activity) {
//   return (
//     <div className="min-h-screen pt-24">
//       <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
//         <h1 className="text-2xl font-bold">Activity not found</h1>
//         <p className="text-slate-500">
//           The activity you’re looking for doesn’t exist or was removed.
//         </p>
//         <button
//           onClick={() => router.back()}
//           className="inline-flex items-center gap-2 text-blue-600 hover:underline"
//         >
//           <ChevronsLeft className="w-4 h-4" />
//           Go back
//         </button>
//       </div>
//     </div>
//   );
// }

//   /* ================= RENDER ================= */
//   return (
//     <div className="bg-white dark:bg-slate-950">
//       {/* ================= HERO ================= */}
//       <section className="relative isolate overflow-hidden">
//         <div
//           className="absolute inset-0 bg-cover bg-center scale-110"
//           style={{
//             backgroundImage: activity.coverImageUrl
//               ? `url(${activity.coverImageUrl})`
//               : undefined,
//           }}
//         />
//         <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />

//         <div className="relative z-10 flex items-center justify-center min-h-[420px] sm:min-h-[460px] px-4 text-center">
//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-4xl sm:text-4xl md:text-5xl font-bold text-white"
//           >
//             {typeLabel(activity.type)}
//           </motion.h1>
          
//         </div>

//        <div className="relative z-10 flex items-center justify-center pb-6 w-full gap-2">
//         {/* BACK BUTTON — BELOW COVER IMAGE */}
//           <motion.button
//             onClick={() => router.back()}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.4 }}
//             className="
//               inline-flex items-center gap-2
//               rounded-full bg-slate/0 backdrop-blur
//               px-4 py-2 text-sm font-medium text-blue-100 
//               dark:text-blue-100 
//               dark:bg-slate-950/0
//               hover:text-blue-400 dark:hover:text-blue-400 transition
//             "
//           >
//           <ChevronsLeft className="w-4 h-4" />
//             All Activities

//           </motion.button>
//      </div>
//    </section>

//       {/* ================= CONTENT ================= */}
//       <motion.section
//         initial={{ opacity: 0, y: 32 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//         className="max-w-7xl mx-auto px-4 py-12 pb-24 space-y-14"
//       >

//     {/* BREADCRUMBS */}
//         <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
//           {/* <Link
//             href="/"
//             className="inline-flex items-center gap-1 hover:text-blue-600 transition"
//           >
//             <Home className="w-4 h-4" />
//             Home
//           </Link> */}

//           <BookMarked className="w-4 h-4" />

//           <Link
//             href="/about/preaching-activities"
//             className="hover:text-blue-600 transition"
//           >
//             Preaching Activities
//           </Link>

//           <ChevronRight className="w-4 h-4" />

//           <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-200 font-medium">
//             {activity.title}
//           </span>
//         </nav>

//       {/* ================= SPLIT HEADER CARD ================= */}
//       <Card
      
//         className="overflow-hidden border border-blue-400/40 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950"
//       >
//         <div className="grid md:grid-cols-2">

//           {/* LEFT: IMAGE */}
//           <div className="relative group h-[240px] sm:h-[300px] md:h-full">
//             <img
//               src={
//                 activity.coverImageUrl ||
//                 activity.gallery?.[0] ||
//                 "/church-contact.jpg"
//               }
//               alt={activity.title}
//               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"

//             />

//             {/* overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
//           </div>

//           {/* RIGHT: CONTENT */}
//           <div className="p-6 sm:p-8 flex flex-col justify-center space-y-5">

//             {/* TITLE */}
//             <div className="space-y-3">
//               <CardTitle className="text-2xl sm:text-3xl md:text-4xl">
//                 {activity.title}
//               </CardTitle>

//               <div className="h-px bg-slate-200 dark:bg-slate-800" />

//               {/* DATE */}
//               <div className="flex items-center gap-2 text-slate-500">
//                 <CalendarDays className="w-4 h-4" />
//                 <span>
//                   {format(new Date(activity.startDate), "MMM d, yyyy • h:mm a")}
//                   {activity.endDate &&
//                     ` — ${format(
//                       new Date(activity.endDate),
//                       "MMM d, yyyy • h:mm a"
//                     )}`}
//                 </span>
//               </div>
//             </div>

//             {/* META GRID */}
//             <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">

//               {/* TYPE */}
//               <div className="flex items-center gap-2">
//                 <Tag className="w-4 h-4 text-slate-500" />
//                 <Badge variant="secondary" className="text-sm rounded-full">
//                   {typeLabel(activity.type)}
//                 </Badge>
//               </div>

//               {/* LOCATION */}
//               {activity.location && (
//                 <div className="flex items-center gap-2">
//                   <MapPin className="w-4 h-4 text-slate-500" />
//                   <span>{activity.location}</span>
//                 </div>
//               )}

//               {/* PREACHER */}
//               {activity.preacher && (
//                 <div className="flex items-center gap-2">
//                   <User className="w-4 h-4 text-slate-500" />
//                   <span>Bro. {activity.preacher}</span>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       </Card>

//      {/* ================= GALLERY ================= */}
//         {activity.gallery.length > 0 && (
//           <div className="space-y-4">
//             <h3 className="text-xl font-semibold">Photos</h3>
//             <div
//               className="relative group overflow-hidden rounded-2xl shadow-lg w-full h-[320px] sm:h-[380px]"
//               onMouseEnter={() => setPaused(true)}
//               onMouseLeave={() => setPaused(false)}
//               onClick={() =>
//                 setLightbox({
//                   images: activity.gallery,
//                   index: activeIndex,
//                 })
//               }
//             >
//               <AnimatePresence initial={false} mode="popLayout">
//                 <motion.div
//                   key={`slide-${activeIndex}`}
//                   className="absolute inset-0"
//                   initial={{ x: `${direction * 100}%` }}
//                   animate={{ x: "0%" }}
//                   exit={{ x: `${direction * -100}%` }}
//                   transition={{ duration: 0.35, ease: "easeInOut" }}
//                 >
//               <Image
//                   src={activity.gallery[activeIndex] || "/church-contact.jpg"}
//                   alt={activity.title}
//                   fill
//                   className="object-cover cursor-zoom-in"
//                   sizes="(max-width: 768px) 100vw, 800px"
//                 />

//                 </motion.div>
//               </AnimatePresence>

//               {/* PREV */}
//               {activity.gallery.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     prevImage();
//                   }}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                 >
//                   <ChevronLeft size={16} />
//                 </button>
//               )}

//               {/* NEXT */}
//               {activity.gallery.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     nextImage();
//                   }}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//               )}
//             </div>

//         {/* DOTS */}
//             <div className="flex justify-center gap-2">
//               {activity.gallery.map((_: string, i: number) => (
//               <button
//                 key={`dot-${i}`}
//                 type="button"
//                 onClick={() => {
//                   setDirection(i > activeIndex ? 1 : -1);
//                   setActiveIndex(i);
//                 }}
//                 className={`w-2 h-2 rounded-full ${
//                   activeIndex === i
//                     ? "bg-blue-600"
//                     : "bg-slate-300"
//                 }`}
//               />
//             ))}
//         </div>
//       </div>
//     )}

//         <AnimatePresence>
//           {lightbox && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
//               onClick={() => setLightbox(null)}
//             >
//               <motion.div
//                 initial={{ scale: 0.9 }}
//                 animate={{ scale: 1 }}
//                 exit={{ scale: 0.9 }}
//                 onClick={(e) => e.stopPropagation()}
//                 className="relative"
//               >
//                 <img
//                   src={lightbox.images[lightbox.index]}
//                   className="max-h-[90vh] max-w-full rounded-lg"
//                 />

//                 <button
//                   onClick={prevLightbox}
//                   className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
//                 >
//                   <ChevronLeft />
//                 </button>

//                 <button
//                   onClick={nextLightbox}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
//                 >
//                   <ChevronRight />
//                 </button>

//                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
//                   {lightbox.index + 1} / {lightbox.images.length}
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* DESCRIPTION */}
//         {activity.description && (
//            <div className="space-y-2">
//              <h3 className="text-xl font-semibold">Description</h3>
//           <p className="text-slate-600 text-lg dark:text-slate-400">
//             {activity.description}
//           </p></div>
//         )}

//         {/* OUTLINE */}
//         {/* OUTLINE */}
//         {activity.outline && (
//           <div className="border rounded-xl overflow-hidden">
//             <button
//               onClick={() => setShowOutline(!showOutline)}
//               className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
//             >
//               <span className="text-xl font-semibold">Outline</span>
//               <ChevronRight
//                 className={`w-5 h-5 transition-transform ${
//                   showOutline ? "rotate-90" : ""
//                 }`}
//               />
//             </button>

//             <AnimatePresence>
//               {showOutline && (
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="px-4 py-4 text-lg overflow-hidden"
//                 >
//                   <CollapsibleMarkdownSections markdown={activity.outline} />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         )}

//         {/* {activity.outline && (
//           <div className="space-y-2">
//             <h3 className="text-xl font-semibold">Outline</h3>
//             <div className="text-lg">
//             <CollapsibleMarkdownSections markdown={activity.outline} />
//             </div>
//           </div>
//         )} */}

//         {/* CONTENT */}
//         {/* REPORT */}
//         {activity.content && (
//           <div className="border rounded-xl overflow-hidden">
//             <button
//               onClick={() => setShowReport(!showReport)}
//               className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
//             >
//               <span className="text-xl font-semibold">Report</span>
//               <ChevronRight
//                 className={`w-5 h-5 transition-transform ${
//                   showReport ? "rotate-90" : ""
//                 }`}
//               />
//             </button>

//             <AnimatePresence>
//               {showReport && (
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="px-4 py-4 text-lg overflow-hidden"
//                 >
//                   <MarkdownBlock content={activity.content} />
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         )}
//         {/* {activity.content && (
//           <div className="space-y-2">
//             <h3 className="text-xl font-semibold">Report</h3>
//             <div className="text-lg">
//             <MarkdownBlock content={activity.content} />
//             </div>
//           </div>
//         )} */}

//       </motion.section>
//     </div>
//   );
// }













// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { format } from "date-fns";
// import Link from "next/link";
// import Image from "next/image";
// import CollapsibleMarkdownSections from "@/components/CollapsibleMarkdownSections";
// import MarkdownBlock from "@/components/MarkdownBlock";
// import {
//   ChevronsLeft,
//   ChevronRight,
//   ChevronLeft,
//   BookMarked,
//   CalendarDays,
//   MapPin,
//   User,
//   Tag,
//   ArrowUpRight,
//   Images,
// } from "lucide-react";

// interface Activity {
//   id?: string;
//   title: string;
//   type: string;
//   gallery: string[];
//   description?: string | null;
//   outline?: string | null;
//   content?: string | null;
//   startDate: string;
//   endDate?: string | null;
//   location?: string | null;
//   preacher?: string | null;
//   coverImageUrl?: string | null;
// }

// async function getActivity(id: string): Promise<Activity | null> {
//   try {
//     const res = await fetch(`/api/preaching-activities/${id}`, {
//       cache: "no-store",
//     });

//     if (!res.ok) throw new Error(`HTTP ${res.status}`);

//     const data = (await res.json()) as Activity;

//     return {
//       ...data,
//       gallery: Array.isArray(data.gallery) ? data.gallery : [],
//     };
//   } catch (err) {
//     console.error("Failed to fetch activity:", err);
//     return null;
//   }
// }

// function typeLabel(type: string) {
//   const map: Record<string, string> = {
//     gospel_meeting: "Gospel Meeting",
//     gospel_preaching: "Gospel Preaching",
//     midweek_service: "Midweek Service",
//     sunday_service: "Sunday Service",
//     visitation: "Visitation",
//     mission_trip: "Mission Trip",
//     youth_service: "Youth Service",
//     special_event: "Special Event",
//     preachers_bible_class: "Preachers Bible Class",
//   };

//   return map[type] ?? type;
// }

// function formatDateRange(startDate?: string | null, endDate?: string | null) {
//   if (!startDate) return "No date available";

//   const start = new Date(startDate);
//   if (Number.isNaN(start.getTime())) return "Invalid date";

//   if (!endDate) {
//     return format(start, "MMMM d, yyyy • h:mm a");
//   }

//   const end = new Date(endDate);
//   if (Number.isNaN(end.getTime())) {
//     return format(start, "MMMM d, yyyy • h:mm a");
//   }

//   return `${format(start, "MMMM d, yyyy • h:mm a")} — ${format(
//     end,
//     "MMMM d, yyyy • h:mm a"
//   )}`;
// }

// export default function PreachingActivityDetailPage() {
//   const router = useRouter();
//   const params = useParams();

//   const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
//   const id = rawId ? String(rawId).split("-")[0] : "";

//   const [activity, setActivity] = useState<Activity | null>(null);
//   const [loading, setLoading] = useState(true);

//   const [paused, setPaused] = useState(false);
//   const [showOutline, setShowOutline] = useState(true);
//   const [showReport, setShowReport] = useState(true);

//   const [direction, setDirection] = useState(1);
//   const [activeIndex, setActiveIndex] = useState(0);

//   const [lightbox, setLightbox] = useState<{
//     images: string[];
//     index: number;
//   } | null>(null);

//   const heroImage = useMemo(() => {
//     return (
//       activity?.coverImageUrl ||
//       activity?.gallery?.[0] ||
//       "/church-contact.jpg"
//     );
//   }, [activity]);

//   useEffect(() => {
//     if (!id) return;

//     let alive = true;

//     const load = async () => {
//       setLoading(true);
//       const data = await getActivity(id);

//       if (!alive) return;

//       setActivity(data);
//       setLoading(false);
//     };

//     load();

//     return () => {
//       alive = false;
//     };
//   }, [id]);

//   useEffect(() => {
//     setActiveIndex(0);
//   }, [activity]);

//   useEffect(() => {
//     if (!activity?.gallery?.length || paused) return;

//     const timer = setInterval(() => {
//       setDirection(1);
//       setActiveIndex((prev) => (prev + 1) % activity.gallery.length);
//     }, 4000);

//     return () => clearInterval(timer);
//   }, [activity, paused]);

//   useEffect(() => {
//     if (!lightbox) return;

//     const handler = (e: KeyboardEvent) => {
//       if (e.key === "ArrowRight") {
//         setLightbox((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 index: (prev.index + 1) % prev.images.length,
//               }
//             : null
//         );
//       }

//       if (e.key === "ArrowLeft") {
//         setLightbox((prev) =>
//           prev
//             ? {
//                 ...prev,
//                 index: (prev.index - 1 + prev.images.length) % prev.images.length,
//               }
//             : null
//         );
//       }

//       if (e.key === "Escape") {
//         setLightbox(null);
//       }
//     };

//     window.addEventListener("keydown", handler);
//     document.body.style.overflow = "hidden";

//     return () => {
//       window.removeEventListener("keydown", handler);
//       document.body.style.overflow = "";
//     };
//   }, [lightbox]);

//   function nextImage() {
//     if (!activity?.gallery?.length) return;
//     setDirection(1);
//     setActiveIndex((prev) => (prev + 1) % activity.gallery.length);
//   }

//   function prevImage() {
//     if (!activity?.gallery?.length) return;
//     setDirection(-1);
//     setActiveIndex((prev) => (prev - 1 + activity.gallery.length) % activity.gallery.length);
//   }

//   function nextLightbox() {
//     setLightbox((prev) =>
//       prev
//         ? {
//             ...prev,
//             index: (prev.index + 1) % prev.images.length,
//           }
//         : null
//     );
//   }

//   function prevLightbox() {
//     setLightbox((prev) =>
//       prev
//         ? {
//             ...prev,
//             index: (prev.index - 1 + prev.images.length) % prev.images.length,
//           }
//         : null
//     );
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-slate-950">
//         <div className="max-w-7xl mx-auto px-4 pt-28 pb-24">
//           <div className="animate-pulse space-y-8">
//             <div className="h-[320px] rounded-3xl bg-slate-200 dark:bg-slate-800" />
//             <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
//               <div className="space-y-4">
//                 <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
//                 <div className="h-5 w-full rounded bg-slate-200 dark:bg-slate-800" />
//                 <div className="h-5 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
//                 <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
//               </div>
//               <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800" />
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!activity) {
//     return (
//       <div className="min-h-screen bg-white dark:bg-slate-950 pt-24">
//         <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
//           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
//             Activity not found
//           </h1>
//           <p className="text-slate-500 dark:text-slate-400">
//             The activity you’re looking for doesn’t exist or may have been removed.
//           </p>
//           <button
//             onClick={() => router.back()}
//             className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
//           >
//             <ChevronsLeft className="w-4 h-4" />
//             Go back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white dark:bg-slate-950">
//       <section className="relative isolate overflow-hidden">
//         <div className="absolute inset-0">
//           <Image
//             src={heroImage}
//             alt={activity.title}
//             fill
//             priority
//             className="object-cover scale-105"
//             sizes="100vw"
//           />
//         </div>

//         <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/65 to-slate-950/90" />

//         <div className="relative z-10 max-w-7xl mx-auto px-4 pt-28 pb-20 sm:pt-32 sm:pb-24">
//           <motion.div
//             initial={{ opacity: 0, y: 22 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.55 }}
//             className="max-w-4xl"
//           >
//             <div className="inline-flex items-center rounded-full bg-white/12 backdrop-blur px-4 py-2 text-xs sm:text-sm font-medium text-white border border-white/15 mb-5">
//               {typeLabel(activity.type)}
//             </div>

//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
//               {activity.title}
//             </h1>

//             <div className="mt-5 flex flex-wrap items-center gap-3 text-sm sm:text-base text-slate-200">
//               <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 backdrop-blur">
//                 <CalendarDays className="w-4 h-4" />
//                 <span>{formatDateRange(activity.startDate, activity.endDate)}</span>
//               </div>

//               {activity.location && (
//                 <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 backdrop-blur">
//                   <MapPin className="w-4 h-4" />
//                   <span>{activity.location}</span>
//                 </div>
//               )}

//               {activity.preacher && (
//                 <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 backdrop-blur">
//                   <User className="w-4 h-4" />
//                   <span>{activity.preacher}</span>
//                 </div>
//               )}
//             </div>

//             <div className="mt-8">
//               <button
//                 onClick={() => router.back()}
//                 className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition"
//               >
//                 <ChevronsLeft className="w-4 h-4" />
//                 Back to Activities
//               </button>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       <section className="max-w-7xl mx-auto px-4 py-10 sm:py-12 pb-24">
//         <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
//           <BookMarked className="w-4 h-4" />
//           <Link
//             href="/preaching-activities"
//             className="hover:text-blue-600 dark:hover:text-blue-400 transition"
//           >
//             Preaching Activities
//           </Link>
//           <ChevronRight className="w-4 h-4" />
//           <span className="truncate max-w-[240px] text-slate-700 dark:text-slate-200 font-medium">
//             {activity.title}
//           </span>
//         </nav>

//         <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
//           <motion.div
//             initial={{ opacity: 0, y: 26 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.55, delay: 0.05 }}
//             className="space-y-8"
//           >
//             {activity.description && (
//               <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-sm">
//                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
//                   Description
//                 </h2>
//                 <p className="text-base sm:text-lg leading-8 text-slate-700 dark:text-slate-300 whitespace-pre-line">
//                   {activity.description}
//                 </p>
//               </section>
//             )}

//             {activity.outline && (
//               <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
//                 <button
//                   onClick={() => setShowOutline((prev) => !prev)}
//                   className="w-full flex items-center justify-between px-6 py-5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
//                 >
//                   <span className="text-xl font-bold text-slate-900 dark:text-white">
//                     Outline
//                   </span>
//                   <ChevronRight
//                     className={`w-5 h-5 text-slate-500 transition-transform ${
//                       showOutline ? "rotate-90" : ""
//                     }`}
//                   />
//                 </button>

//                 <AnimatePresence initial={false}>
//                   {showOutline && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       transition={{ duration: 0.28 }}
//                       className="overflow-hidden"
//                     >
//                       <div className="px-6 pb-6 text-base sm:text-lg">
//                         <CollapsibleMarkdownSections markdown={activity.outline} />
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </section>
//             )}

//             {activity.content && (
//               <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
//                 <button
//                   onClick={() => setShowReport((prev) => !prev)}
//                   className="w-full flex items-center justify-between px-6 py-5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
//                 >
//                   <span className="text-xl font-bold text-slate-900 dark:text-white">
//                     Report
//                   </span>
//                   <ChevronRight
//                     className={`w-5 h-5 text-slate-500 transition-transform ${
//                       showReport ? "rotate-90" : ""
//                     }`}
//                   />
//                 </button>

//                 <AnimatePresence initial={false}>
//                   {showReport && (
//                     <motion.div
//                       initial={{ height: 0, opacity: 0 }}
//                       animate={{ height: "auto", opacity: 1 }}
//                       exit={{ height: 0, opacity: 0 }}
//                       transition={{ duration: 0.28 }}
//                       className="overflow-hidden"
//                     >
//                       <div className="px-6 pb-6 text-base sm:text-lg">
//                         <MarkdownBlock content={activity.content} />
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </section>
//             )}
//           </motion.div>

//           <motion.aside
//             initial={{ opacity: 0, y: 26 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.55, delay: 0.12 }}
//             className="space-y-8 xl:sticky xl:top-24"
//           >
//             <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
//               <div className="relative h-64 sm:h-72">
//                 <Image
//                   src={heroImage}
//                   alt={activity.title}
//                   fill
//                   className="object-cover"
//                   sizes="(max-width: 1280px) 100vw, 40vw"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
//               </div>

//               <div className="p-6">
//                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">
//                   Activity Info
//                 </h2>

//                 <div className="space-y-4 text-sm sm:text-base">
//                   <div className="flex items-start gap-3">
//                     <Tag className="w-4 h-4 mt-1 text-slate-500" />
//                     <div>
//                       <p className="text-slate-500 dark:text-slate-400">Type</p>
//                       <p className="font-semibold text-slate-900 dark:text-white">
//                         {typeLabel(activity.type)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <CalendarDays className="w-4 h-4 mt-1 text-slate-500" />
//                     <div>
//                       <p className="text-slate-500 dark:text-slate-400">Date</p>
//                       <p className="font-semibold text-slate-900 dark:text-white">
//                         {formatDateRange(activity.startDate, activity.endDate)}
//                       </p>
//                     </div>
//                   </div>

//                   {activity.location && (
//                     <div className="flex items-start gap-3">
//                       <MapPin className="w-4 h-4 mt-1 text-slate-500" />
//                       <div>
//                         <p className="text-slate-500 dark:text-slate-400">Location</p>
//                         <p className="font-semibold text-slate-900 dark:text-white">
//                           {activity.location}
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {activity.preacher && (
//                     <div className="flex items-start gap-3">
//                       <User className="w-4 h-4 mt-1 text-slate-500" />
//                       <div>
//                         <p className="text-slate-500 dark:text-slate-400">Preacher</p>
//                         <p className="font-semibold text-slate-900 dark:text-white">
//                           {activity.preacher}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </section>

//             {activity.gallery.length > 0 && (
//               <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
//                 <div className="flex items-center justify-between gap-3 mb-4">
//                   <div className="flex items-center gap-2">
//                     <Images className="w-5 h-5 text-slate-500" />
//                     <h2 className="text-xl font-bold text-slate-900 dark:text-white">
//                       Photos
//                     </h2>
//                   </div>

//                   <span className="text-sm text-slate-500 dark:text-slate-400">
//                     {activity.gallery.length} image
//                     {activity.gallery.length !== 1 ? "s" : ""}
//                   </span>
//                 </div>

//                 <div
//                   className="relative group overflow-hidden rounded-2xl w-full h-[300px] sm:h-[340px] bg-slate-100 dark:bg-slate-800"
//                   onMouseEnter={() => setPaused(true)}
//                   onMouseLeave={() => setPaused(false)}
//                   onClick={() =>
//                     setLightbox({
//                       images: activity.gallery,
//                       index: activeIndex,
//                     })
//                   }
//                 >
//                   <AnimatePresence initial={false} mode="popLayout">
//                     <motion.div
//                       key={`slide-${activeIndex}`}
//                       className="absolute inset-0"
//                       initial={{ x: `${direction * 100}%` }}
//                       animate={{ x: "0%" }}
//                       exit={{ x: `${direction * -100}%` }}
//                       transition={{ duration: 0.35, ease: "easeInOut" }}
//                     >
//                       <Image
//                         src={activity.gallery[activeIndex] || "/church-contact.jpg"}
//                         alt={`${activity.title} ${activeIndex + 1}`}
//                         fill
//                         className="object-cover cursor-zoom-in"
//                         sizes="(max-width: 1280px) 100vw, 40vw"
//                       />
//                     </motion.div>
//                   </AnimatePresence>

//                   {activity.gallery.length > 1 && (
//                     <>
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           prevImage();
//                         }}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                       >
//                         <ChevronLeft size={18} />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           nextImage();
//                         }}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
//                       >
//                         <ChevronRight size={18} />
//                       </button>
//                     </>
//                   )}

//                   <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs text-white backdrop-blur">
//                     {activeIndex + 1} / {activity.gallery.length}
//                   </div>
//                 </div>

//                 {activity.gallery.length > 1 && (
//                   <div className="flex justify-center gap-2 mt-4">
//                     {activity.gallery.map((_, i) => (
//                       <button
//                         key={`dot-${i}`}
//                         type="button"
//                         onClick={() => {
//                           setDirection(i > activeIndex ? 1 : -1);
//                           setActiveIndex(i);
//                         }}
//                         className={`h-2.5 rounded-full transition-all ${
//                           activeIndex === i
//                             ? "w-8 bg-blue-600"
//                             : "w-2.5 bg-slate-300 dark:bg-slate-700"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </section>
//             )}

//             <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
//               <Link
//                 href="/preaching-activities"
//                 className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
//               >
//                 View all activities
//                 <ArrowUpRight className="w-4 h-4" />
//               </Link>
//             </section>
//           </motion.aside>
//         </div>
//       </section>

//       <AnimatePresence>
//         {lightbox && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center px-4"
//             onClick={() => setLightbox(null)}
//           >
//             <motion.div
//               initial={{ scale: 0.96, opacity: 0.7 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.96, opacity: 0.7 }}
//               transition={{ duration: 0.22 }}
//               onClick={(e) => e.stopPropagation()}
//               className="relative w-full max-w-6xl"
//             >
//               <div className="relative w-full h-[72vh] sm:h-[82vh]">
//                 <Image
//                   src={lightbox.images[lightbox.index]}
//                   alt={`Preview ${lightbox.index + 1}`}
//                   fill
//                   className="object-contain"
//                   sizes="100vw"
//                 />
//               </div>

//               {lightbox.images.length > 1 && (
//                 <>
//                   <button
//                     onClick={prevLightbox}
//                     className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-11 h-11 rounded-full flex items-center justify-center"
//                   >
//                     <ChevronLeft />
//                   </button>

//                   <button
//                     onClick={nextLightbox}
//                     className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-11 h-11 rounded-full flex items-center justify-center"
//                   >
//                     <ChevronRight />
//                   </button>
//                 </>
//               )}

//               <button
//                 onClick={() => setLightbox(null)}
//                 className="absolute top-3 right-3 rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white"
//               >
//                 Close
//               </button>

//               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
//                 {lightbox.index + 1} / {lightbox.images.length}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



