"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, MapPin, UserRound, ArrowUpRight } from "lucide-react";

type Activity = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  preacher?: string | null;
  location?: string | null;
  startDate?: string | null;
  coverImageUrl?: string | null;
};

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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function truncateText(text: string, max = 140) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + "...";
}

export default function PreachingActivityItem({ a }: { a: Activity }) {
  const href = `/about/preaching-activities/${a.id}-${createSlug(a.title)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="h-full"
    >
      <Link
        href={href}
        className="group block h-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
          {a.coverImageUrl ? (
            <Image
              src={a.coverImageUrl}
              alt={a.title}
              fill
              sizes="(max-width: 768px) 100vw,
                     (max-width: 1200px) 50vw,
                      33vw"
              loading="lazy"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-100 to-slate-200 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-white/40 dark:bg-slate-950/70 backdrop-blur px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 border border-white/20 dark:border-slate-700">
              {typeLabel(a.type)}
            </span>
          </div>

          <div className="absolute right-4 top-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 dark:bg-slate-950/80 text-slate-900 dark:text-white border border-white/40 dark:border-slate-700 backdrop-blur transition group-hover:scale-110">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
            {a.title}
          </h3>

          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {a.startDate && (
              <div className="flex items-start gap-2">
                <CalendarDays size={16} className="mt-[2px] shrink-0" />
                <span>{format(new Date(a.startDate), "MMM d, yyyy • h:mm a")}</span>
              </div>
            )}

            {a.preacher && (
              <div className="flex items-start gap-2">
                <UserRound size={16} className="mt-[2px] shrink-0" />
                <span>{a.preacher}</span>
              </div>
            )}

            {a.location && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-[2px] shrink-0" />
                <span>{a.location}</span>
              </div>
            )}
          </div>

          {a.description && (
            <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">
              {truncateText(a.description, 155)}
            </p>
          )}

          <div className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
            View details
            <ArrowUpRight size={16} className="ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}