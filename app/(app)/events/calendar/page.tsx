"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Event = {
  id: number;
  title: string;
  eventDate: string; 
  location?: string | null;
};

function getMonthMatrix(year: number, month: number) {
  // month: 0-based
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0=Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weeks: (number | null)[][] = [];
  let current = 1 - startDay;

  while (current <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      if (current < 1 || current > daysInMonth) week.push(null);
      else week.push(current);
      current++;
    }
    weeks.push(week);
  }

  return weeks;
}

export default function EventsCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-based
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data));
  }, []);

  const matrix = getMonthMatrix(year, month);

  const monthName = new Date(year, month, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

function monthEvents(day: number | null) {
  if (!day) return [];

  const dateStr = new Date(year, month, day).toISOString().slice(0, 10);

  return events.filter(
    (e) => e.eventDate.slice(0, 10) === dateStr
  );
}


  function prevMonth() {
    setMonth((m) => {
      if (m === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setMonth((m) => {
      if (m === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events Calendar</h1>
          <p className="text-sm text-slate-600">
            View upcoming events by calendar.
          </p>
        </div>
        <Link href="/events" className="text-sm text-sky-600 hover:underline">
          Back to list
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="px-2 py-1 text-sm border rounded"
          >
            ‹ Prev
          </button>
          <p className="font-semibold">{monthName}</p>
          <button
            onClick={nextMonth}
            className="px-2 py-1 text-sm border rounded"
          >
            Next ›
          </button>
        </div>

        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-slate-50 dark:bg-slate-700">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <th key={d} className="p-1 text-center font-semibold">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((week, wi) => (
              <tr key={wi} className="border-b last:border-0">
                {week.map((day, di) => {
                  const dayEvents = monthEvents(day);
                  return (
                    <td
                      key={di}
                      className={`align-top h-20 p-1 border-l last:border-r text-[11px] ${
                        day ? "" : "bg-slate-50"
                      }`}
                    >
                      {day && (
                        <div className="font-semibold text-right text-slate-600">
                          {day}
                        </div>
                      )}
                      <div className="space-y-1 mt-1">
                        {dayEvents.map((e) => (
                          <Link
                            key={e.id}
                            href={`/events/${e.id}`}
                            className="block truncate rounded bg-sky-100 text-sky-900 px-1 py-[2px]"
                          >
                            {e.title}
                          </Link>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
