

import { notFound } from "next/navigation";
import Link from "next/link";
import PublicScheduleMap from "@/components/PublicScheduleMap";

import {
  format,
  differenceInMinutes,
  addWeeks,
  addMonths,
} from "date-fns";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { getNextOccurrence } from "@/lib/schedule";
import AddToCalendar from "@/components/AddToCalendar";

/* ---------------- HELPERS ---------------- */

function formatTimeRange(start?: string, end?: string) {
  if (!start) return "—";
  const s = format(new Date(start), "h:mm a");
  if (!end) return s;
  const e = format(new Date(end), "h:mm a");
  return `${s} – ${e}`;
}

function durationLabel(start?: string, end?: string) {
  if (!start || !end) return null;
  const mins = differenceInMinutes(new Date(end), new Date(start));
  if (mins < 60) return `${mins} minutes`;
  if (mins % 60 === 0) return `${mins / 60} hour${mins > 60 ? "s" : ""}`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function timezoneLabel(date: Date) {
  const offset = -date.getTimezoneOffset() / 60;
  return `GMT${offset >= 0 ? "+" : ""}${offset}`;
}

function recurrenceBadge(r?: string | null) {
  if (!r) return null;

  let cls =
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  if (r === "WEEKLY")
    cls =
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300";

  if (r === "MONTHLY_LAST")
    cls =
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";

  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${cls}`}>
      {r === "WEEKLY"
        ? "Weekly"
        : r === "MONTHLY_LAST"
        ? "Monthly (Last Week)"
        : r}
    </span>
  );
}

function getNextThreeOccurrences(
  start: Date,
  recurrence: string
): Date[] | "CUSTOM" {
  if (recurrence === "WEEKLY") {
    return [1, 2, 3].map((i) => addWeeks(start, i));
  }

  if (recurrence === "MONTHLY_LAST") {
    return [1, 2, 3].map((i) => addMonths(start, i));
  }

  return "CUSTOM";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ---------------- DATA ---------------- */

async function getSchedule(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/schedules/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

/* ---------------- PAGE ---------------- */

export default async function ScheduleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedule = await getSchedule(id);
  if (!schedule) return notFound();

  const start = schedule.eventDate
    ? new Date(schedule.eventDate)
    : new Date(schedule.createdAt);

  const isPast = start < new Date();
  const duration = durationLabel(schedule.eventDate, schedule.endDate);
  const tz = timezoneLabel(start);

  const next =
    !isPast && schedule.recurrence && schedule.eventDate
      ? getNextOccurrence(schedule.eventDate, schedule.recurrence)
      : null;

  const nextThree =
    !isPast && schedule.recurrence
      ? getNextThreeOccurrences(start, schedule.recurrence)
      : null;

  return (
    <div className="max-w-6xl mx-auto pt-[calc(72px+2rem)] px-4 pb-32 space-y-12">
      {/* BACK */}

      <Link
        href="/schedules"
        className="inline-flex items-center gap-1 pt-8 text-md font-semibold text-blue-600 hover:text-blue-700"
      >
        <ChevronsLeft className="w-6 h-6" />
        All Schedules
      </Link>

      {/* STATUS */}
      <div
        className={`w-full px-4 py-2 rounded-md text-md font-medium ${
          isPast
            ? "bg-amber-200 text-amber-900"
            : "bg-emerald-200 text-emerald-900"
        }`}
      >
        {isPast ? "This schedule has passed." : "Upcoming schedule"}
      </div>

      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-4xl text-slate-900 dark:text-slate-50 font-bold">
            {schedule.title || schedule.serviceName}
          </h1>
          {recurrenceBadge(schedule.recurrence)}
        </div>

        <p className="text-md text-slate-700 dark:text-slate-200">
          {format(start, "MMMM d, yyyy")} | {schedule.day} • @{" "}
          {formatTimeRange(schedule.eventDate, schedule.endDate)} ({tz})
        </p>

        {duration && (
          <p className="text-md text-slate-700 dark:text-slate-200">
            Duration: {duration}
          </p>
        )}

        {/* 🔁 NEXT OCCURRENCE (AUTO-HIDE WHEN PAST) */}
        {!isPast && schedule.recurrence && (
          <div className="text-md text-slate-700 dark:text-slate-200 space-y-1">
            <p>
              🔁 Next occurrence:{" "}
              {next === "CUSTOM"
                ? "Based on custom schedule"
                : next
                ? next.toLocaleDateString()
                : "—"}
            </p>

            {/* 🗓 NEXT 3 */}
            {Array.isArray(nextThree) && (
              <ul className="list-disc ml-5 text-sm">
                {nextThree.map((d, i) => (
                  <li key={i}>{format(d, "MMMM d, yyyy")}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* ADD TO CALENDAR (DESKTOP) */}
        {/* ADD TO CALENDAR */}
        <AddToCalendar
          title={schedule.title || schedule.serviceName}
          start={schedule.eventDate}
          end={schedule.endDate}
          location={schedule.location}
          scheduleId={schedule.id}
        />

      {/* MINI WEEKLY CALENDAR */}
      <div className="rounded-lg border p-4 max-w-md">
        <p className="font-semibold mb-3">Weekly Calendar</p>
        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {WEEKDAYS.map((d) => {
            const isEventDay =
              schedule.day.toLowerCase().startsWith(d.toLowerCase());
            const isToday = format(new Date(), "EEE") === d;

            return (
              <div
                key={d}
                className={`py-2 rounded-md ${
                  isEventDay
                    ? "bg-blue-600 text-white "
                    : isToday
                    ? "border border-blue-500"
                    : "bg-slate-100  dark:bg-slate-900"
                }`}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>


      {/* DETAILS */}
    <div className="rounded-lg border p-5 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT — DETAILS */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold h-7">Details</h2>

          <div className="space-y-3 text-md">
            <p>
              <span className="font-semibold">Date:</span><br />
              {schedule.eventDate
                ? format(new Date(schedule.eventDate), "MMMM d, yyyy")
                : "—"}
            </p>

            <p>
              <span className="font-semibold">Preacher:</span><br />
              {schedule.preacher || "—"}
            </p>

            <p>
              <span className="font-semibold">Service Name:</span><br />
              {schedule.serviceName || "—"}
            </p>
          </div>
        </div>

        {/* MIDDLE — LOCATION TEXT */}
        <div className="space-y-4 ">
          
          <h2 className="text-lg font-semibold h-7">📍 Location</h2>

          <div className="text-md space-y-2">
            <p className="font-medium">
              {schedule.location || "—"}
            </p>

            {schedule.latitude && schedule.longitude && (
              <a
                href={`https://www.google.com/maps?q=${schedule.latitude},${schedule.longitude}`}
                target="_blank"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                View on Google Maps ↗
              </a>
            )}
          </div>
        </div>

      {/* 🔽 MOBILE DIVIDER (ONLY shows on mobile) */}
        <div className="lg:hidden border-t pt-4" />

        {/* RIGHT — MAP */}
          <div className="rounded-2xl border backdrop-blur bg-white/80 dark:bg-slate-900/60 p-4">
            {schedule.latitude && schedule.longitude ? (
              <div className="rounded-xl overflow-hidden border">
                <PublicScheduleMap
                  latitude={schedule.latitude}
                  longitude={schedule.longitude}
                  location={schedule.location}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">
                Map not available for this location.
              </p>
            )}
          </div>
      </div>
    </div>

      {/* LINKED ACTIVITIES */}
      {schedule.preachingActivities?.length > 0 && (
        <div className="pt-6 space-y-3">
          <h2 className="text-lg font-semibold">
            Preaching Activities
          </h2>

          {schedule.preachingActivities.map((a: any) => (
            <div
              key={a.id}
              className="rounded-lg border p-4 hover:bg-slate-50 transition"
            >
              <h3 className="font-medium">{a.title}</h3>
              <p className="text-xs text-slate-500">
                {new Date(a.startDate).toLocaleString()}
              </p>
              <Link
                href={`/about/preaching-activities/${a.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
              >
                View details <ChevronsRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
      {/* 📱 STICKY ADD TO CALENDAR (MOBILE) */}
      {/* {!isPast && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-50">
          <AddToCalendar
            title={schedule.title || schedule.serviceName}
            start={schedule.eventDate}
            end={schedule.endDate}
            location={schedule.location}
            scheduleId={schedule.id}
          
          />
        </div>
      )} */}
    </div>
  );
}
