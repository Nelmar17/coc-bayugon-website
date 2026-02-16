"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
} from "date-fns";

type AttendanceItem = {
  date: string;
  status: "present" | "absent";
  type: string;
};

export default function CalendarAttendance({
  year,
  month,
  days,
  onOpenDay,
}: {
  year: number;
  month: number;
  days: Record<string, AttendanceItem[]>;
  onOpenDay: (date: string) => void;
}) {
  const start = startOfWeek(startOfMonth(new Date(year, month)));
  const end = endOfWeek(endOfMonth(new Date(year, month)));

  const allDays = eachDayOfInterval({ start, end });

  function statusOf(date: Date) {
    const key = format(date, "yyyy-MM-dd");
    const items = days[key];
    if (!items) return null;
    return items.some((i) => i.status === "present") ? "present" : "absent";
  }

  return (
    <div className="grid grid-cols-7 gap-2 text-center text-sm ">
      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
        <div key={d} className="font-medium text-slate-500">{d}</div>
      ))}

      {allDays.map((d) => {
        const inMonth = isSameMonth(d, new Date(year, month));
        const status = statusOf(d);

        return (
          <button
            key={d.toISOString()}
            disabled={!inMonth || !status}
            onClick={() => status && onOpenDay(format(d, "yyyy-MM-dd"))}
            className={[
              "h-12 rounded-md flex flex-col items-center justify-center relative",
              inMonth ? "hover:bg-blue-200 dark:hover:bg-blue-600" : "opacity-40",
            ].join(" ")}
          >
            <span>{format(d, "d")}</span>

            {status && (
              <span
                className={[
                  "absolute bottom-1 h-2 w-2 rounded-full",
                  status === "present"
                    ? "bg-green-500"
                    : "bg-slate-400",
                ].join(" ")}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
