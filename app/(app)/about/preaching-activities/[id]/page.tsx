"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import CollapsibleMarkdownSections from "@/components/CollapsibleMarkdownSections";
import MarkdownBlock from "@/components/MarkdownBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
          ChevronsLeft,
          ChevronRight,
          ChevronLeft,
          BookMarked,
          CalendarDays, MapPin, User, Tag 
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
      gallery: data.gallery ?? [],
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
    midweek_service: "Midweek Service",
    sunday_service: "Sunday Service",
    visitation: "Visitation",
    mission_trip: "Mission Trip",
    youth_service: "Youth Service",
    special_event: "Special Event",
  };
  return map[type] ?? type;
}

/* ================= PAGE ================= */
export default function PreachingActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  /* 🔗 SLUG FIX: extract numeric ID */
  const { id: raw } = use(params);
  const id = raw.split("-")[0]; // "1-title-here" → "1"

  const [activity, setActivity] = useState<Activity | null>(null);

  // const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* gallery */
  const [paused, setPaused] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [direction, setDirection] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  const [lightbox, setLightbox] = useState<{
    images: string[];
    index: number;
  } | null>(null);


  const nextImage = () => {
  if (!activity?.gallery?.length) return;
  setDirection(1);
  setActiveIndex((prev) =>
    (prev + 1) % activity.gallery.length
  );
};

const prevImage = () => {
  if (!activity?.gallery?.length) return;
  setDirection(-1);
  setActiveIndex((prev) =>
    (prev - 1 + activity.gallery.length) %
    activity.gallery.length
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
    index:
      (lightbox.index - 1 + lightbox.images.length) %
      lightbox.images.length,
  });
};


useEffect(() => {
  if (!activity?.gallery?.length) return;
  if (paused) return;

  const timer = setInterval(() => {
    setDirection(1);
    setActiveIndex((prev) =>
      (prev + 1) % activity.gallery.length
    );
  }, 4000);

  return () => clearInterval(timer);
}, [activity, paused]);


  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      const data = await getActivity(id);
      setActivity(data);
      setLoading(false);
    };
    load();
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
  return () => window.removeEventListener("keydown", handler);
}, [lightbox]);


  /* ================= STATES ================= */
  if (loading) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-500">
        Loading…
      </section>
    );
  }

  if (!activity) {
    return (
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h1 className="text-2xl font-bold">Activity not found</h1>
      </section>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: activity.coverImageUrl
              ? `url(${activity.coverImageUrl})`
              : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85" />

        <div className="relative z-10 flex items-center justify-center min-h-[420px] sm:min-h-[460px] px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-4xl md:text-5xl font-bold text-white"
          >
            {typeLabel(activity.type)}
          </motion.h1>
          
        </div>

       <div className="relative z-10 flex items-center justify-center pb-6 w-full gap-2">
        {/* BACK BUTTON — BELOW COVER IMAGE */}
          <motion.button
            onClick={() => router.back()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="
              inline-flex items-center gap-2
              rounded-full bg-slate/0 backdrop-blur
              px-4 py-2 text-sm font-medium text-blue-100 
              dark:text-blue-100 
              dark:bg-slate-950/0
              hover:text-blue-400 dark:hover:text-blue-400 transition
            "
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
        className="max-w-7xl mx-auto px-4 py-12 pb-24 space-y-14"
      >

    {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-blue-600 transition"
          >
            <Home className="w-4 h-4" />
            Home
          </Link> */}

          <BookMarked className="w-4 h-4" />

          <Link
            href="/about/preaching-activities"
            className="hover:text-blue-600 transition"
          >
            Preaching Activities
          </Link>

          <ChevronRight className="w-4 h-4" />

          <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-200 font-medium">
            {activity.title}
          </span>
        </nav>

      {/* ================= SPLIT HEADER CARD ================= */}
      <Card
      
        className="overflow-hidden border border-blue-400/40 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-950"
      >
        <div className="grid md:grid-cols-2">

          {/* LEFT: IMAGE */}
          <div className="relative group h-[240px] sm:h-[300px] md:h-full">
            <img
              src={
                activity.coverImageUrl ||
                activity.gallery?.[0] ||
                "/church-contact.jpg"
              }
              alt={activity.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"

            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
          </div>

          {/* RIGHT: CONTENT */}
          <div className="p-6 sm:p-8 flex flex-col justify-center space-y-5">

            {/* TITLE */}
            <div className="space-y-3">
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl">
                {activity.title}
              </CardTitle>

              <div className="h-px bg-slate-200 dark:bg-slate-800" />

              {/* DATE */}
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {format(new Date(activity.startDate), "MMM d, yyyy • h:mm a")}
                  {activity.endDate &&
                    ` — ${format(
                      new Date(activity.endDate),
                      "MMM d, yyyy • h:mm a"
                    )}`}
                </span>
              </div>
            </div>

            {/* META GRID */}
            <div className="grid sm:grid-cols-2 gap-4 text-sm sm:text-base">

              {/* TYPE */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-500" />
                <Badge variant="secondary" className="text-sm rounded-full">
                  {typeLabel(activity.type)}
                </Badge>
              </div>

              {/* LOCATION */}
              {activity.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{activity.location}</span>
                </div>
              )}

              {/* PREACHER */}
              {activity.preacher && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Bro. {activity.preacher}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </Card>

     {/* ================= GALLERY ================= */}
        {activity.gallery.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Photos</h3>
            <div
              className="relative group overflow-hidden rounded-2xl shadow-lg w-full h-[320px] sm:h-[380px]"
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
                  alt={activity.title}
                  fill
                  className="object-cover cursor-zoom-in"
                  sizes="(max-width: 768px) 100vw, 800px"
                />

                </motion.div>
              </AnimatePresence>

              {/* PREV */}
              {activity.gallery.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {/* NEXT */}
              {activity.gallery.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

        {/* DOTS */}
            <div className="flex justify-center gap-2">
              {activity.gallery.map((_: string, i: number) => (
              <button
                key={`dot-${i}`}
                type="button"
                onClick={() => {
                  setDirection(i > activeIndex ? 1 : -1);
                  setActiveIndex(i);
                }}
                className={`w-2 h-2 rounded-full ${
                  activeIndex === i
                    ? "bg-blue-600"
                    : "bg-slate-300"
                }`}
              />
            ))}
        </div>
      </div>
    )}

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
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="relative"
              >
                <img
                  src={lightbox.images[lightbox.index]}
                  className="max-h-[90vh] max-w-full rounded-lg"
                />

                <button
                  onClick={prevLightbox}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  <ChevronLeft />
                </button>

                <button
                  onClick={nextLightbox}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
                >
                  <ChevronRight />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                  {lightbox.index + 1} / {lightbox.images.length}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DESCRIPTION */}
        {activity.description && (
           <div className="space-y-2">
             <h3 className="text-xl font-semibold">Description</h3>
          <p className="text-slate-600 text-lg dark:text-slate-400">
            {activity.description}
          </p></div>
        )}

        {/* OUTLINE */}
        {/* OUTLINE */}
        {activity.outline && (
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowOutline(!showOutline)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <span className="text-xl font-semibold">Outline</span>
              <ChevronRight
                className={`w-5 h-5 transition-transform ${
                  showOutline ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showOutline && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-4 text-lg overflow-hidden"
                >
                  <CollapsibleMarkdownSections markdown={activity.outline} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* {activity.outline && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Outline</h3>
            <div className="text-lg">
            <CollapsibleMarkdownSections markdown={activity.outline} />
            </div>
          </div>
        )} */}

        {/* CONTENT */}
        {/* REPORT */}
        {activity.content && (
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => setShowReport(!showReport)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <span className="text-xl font-semibold">Report</span>
              <ChevronRight
                className={`w-5 h-5 transition-transform ${
                  showReport ? "rotate-90" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showReport && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 py-4 text-lg overflow-hidden"
                >
                  <MarkdownBlock content={activity.content} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        {/* {activity.content && (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Report</h3>
            <div className="text-lg">
            <MarkdownBlock content={activity.content} />
            </div>
          </div>
        )} */}

      </motion.section>
    </div>
  );
}
