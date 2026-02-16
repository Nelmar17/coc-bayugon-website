"use client";

import { useMemo } from "react";
import { CalendarPlus, } from "lucide-react";

export default function AddToCalendar({
  title,
  start,
  end,
  location,
  scheduleId,
  icsUrl,
}: {
  title: string;
  start?: string | null;
  end?: string | null;
  location?: string | null;
  scheduleId?: number | string; // keeps old usage
  icsUrl?: string; // for events
}) {
  const googleCalendarUrl = useMemo(() => {
    const safeTitle = encodeURIComponent(title || "");
    const safeLoc = encodeURIComponent(location || "");

    const s = start ? start.replace(/[-:]/g, "").replace(".000Z", "Z") : "";
    const e = end ? end.replace(/[-:]/g, "").replace(".000Z", "Z") : s;

    const dates = s ? `${s}/${e || s}` : "";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${safeTitle}&dates=${dates}&location=${safeLoc}`;
  }, [title, start, end, location]);

  const resolvedIcs = icsUrl || (scheduleId ? `/api/calendar/ics?scheduleId=${scheduleId}` : null);

  return (
    <details className="inline-block">
      <summary className="list-none cursor-pointer">
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md
          border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-950"
        >
          <CalendarPlus className="w-4 h-4" />
          Add to Calendar
        </span>
      </summary>

      <div className="mt-2 w-56 rounded-md border bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Google Calendar
        </a>

        {resolvedIcs && (
          <a
            href={resolvedIcs}
            className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Apple Calendar (.ics)
          </a>
        )}

        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Outlook
        </a>
      </div>
    </details>
  );
}
